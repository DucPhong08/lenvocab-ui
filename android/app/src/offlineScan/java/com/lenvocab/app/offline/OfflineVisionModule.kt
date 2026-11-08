package com.lenvocab.app.offline

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.media.ExifInterface
import android.net.Uri
import android.os.SystemClock
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.lenvocab.app.specs.NativeOfflineVisionSpec
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import org.tensorflow.lite.DataType
import org.tensorflow.lite.Interpreter

class OfflineVisionModule(private val context: ReactApplicationContext) : NativeOfflineVisionSpec(context) {
  private val executor = Executors.newSingleThreadExecutor()
  private val busy = AtomicBoolean(false)

  override fun getName() = NAME

  override fun detect(uri: String, minScore: Double, maxResults: Double, promise: Promise) {
    if (!busy.compareAndSet(false, true)) {
      promise.reject("BUSY", "Đang nhận diện ảnh trước đó.")
      return
    }
    executor.execute {
      try {
        require(minScore.isFinite() && minScore in 0.0..1.0 && maxResults in 1.0..10.0 && maxResults % 1 == 0.0) { "Thiết lập nhận diện không hợp lệ." }
        promise.resolve(detect(Uri.parse(uri), minScore.toFloat(), maxResults.toInt()))
      } catch (error: Exception) {
        promise.reject("OFFLINE_SCAN_FAILED", error.message ?: "Chưa nhận diện được ảnh trên máy.", error)
      } finally {
        busy.set(false)
      }
    }
  }

  private fun detect(uri: Uri, minScore: Float, limit: Int): WritableMap {
    val start = SystemClock.elapsedRealtime()
    val bitmap = decode(uri)
    try {
      val labels = context.assets.open("labels.txt").bufferedReader().use { it.readLines() }
      val bytes = context.assets.open("efficientdet-lite0.tflite").use { it.readBytes() }
      val model = ByteBuffer.allocateDirect(bytes.size).order(ByteOrder.nativeOrder()).apply { put(bytes); rewind() }
      Interpreter(model, Interpreter.Options().setNumThreads(2)).use { interpreter ->
        require(interpreter.getInputTensor(0).shape().contentEquals(intArrayOf(1, SIZE, SIZE, 3)) && interpreter.getInputTensor(0).dataType() == DataType.UINT8) { "Model không đúng định dạng ảnh đã cấu hình." }
        val count = interpreter.getOutputTensor(0).shape()[1]
        require(interpreter.outputTensorCount == 4 && interpreter.getOutputTensor(0).shape().last() == 4 && count <= 100) { "Model không đúng định dạng kết quả đã cấu hình." }
        val boxes = Array(1) { Array(count) { FloatArray(4) } }
        val classes = Array(1) { FloatArray(count) }
        val scores = Array(1) { FloatArray(count) }
        val total = FloatArray(1)
        val input = input(bitmap)
        interpreter.runForMultipleInputsOutputs(arrayOf(input.buffer), mapOf(0 to boxes, 1 to classes, 2 to scores, 3 to total))
        val objects = Arguments.createArray()
        var found = 0
        val candidates = (0 until min(count, total[0].toInt())).sortedByDescending { scores[0][it] }
        for (index in candidates) {
          val score = scores[0][index]
          val labelId = classes[0][index].toInt()
          val label = labels.getOrNull(labelId) ?: continue
          if (!score.isFinite() || score < minScore || label == "???" || found >= limit) continue
          val raw = boxes[0][index]
          if (raw.any { !it.isFinite() }) continue
          val left = ((raw[1] * SIZE - input.left) / input.width).coerceIn(0f, 1f)
          val top = ((raw[0] * SIZE - input.top) / input.height).coerceIn(0f, 1f)
          val right = ((raw[3] * SIZE - input.left) / input.width).coerceIn(0f, 1f)
          val bottom = ((raw[2] * SIZE - input.top) / input.height).coerceIn(0f, 1f)
          if (right <= left || bottom <= top) continue
          objects.pushMap(Arguments.createMap().apply {
            putInt("labelId", labelId); putString("label", label); putDouble("score", score.toDouble())
            putMap("box", Arguments.createMap().apply {
              putDouble("left", left.toDouble()); putDouble("top", top.toDouble())
              putDouble("width", (right-left).toDouble()); putDouble("height", (bottom-top).toDouble())
            })
          })
          found++
        }
        return Arguments.createMap().apply {
          putInt("width", bitmap.width); putInt("height", bitmap.height)
          putDouble("elapsedMs", (SystemClock.elapsedRealtime() - start).toDouble())
          putArray("objects", objects)
        }
      }
    } finally { bitmap.recycle() }
  }

  private data class Input(val buffer: ByteBuffer, val left: Float, val top: Float, val width: Float, val height: Float)

  private fun input(bitmap: Bitmap): Input {
    val scale = min(SIZE.toFloat()/bitmap.width, SIZE.toFloat()/bitmap.height)
    val width = max(1, (bitmap.width*scale).roundToInt())
    val height = max(1, (bitmap.height*scale).roundToInt())
    val left = (SIZE-width)/2f
    val top = (SIZE-height)/2f
    val resized = Bitmap.createScaledBitmap(bitmap, width, height, true)
    val padded = Bitmap.createBitmap(SIZE, SIZE, Bitmap.Config.ARGB_8888)
    try {
      val canvas = Canvas(padded)
      canvas.drawColor(Color.BLACK)
      canvas.drawBitmap(resized, left, top, Paint(Paint.FILTER_BITMAP_FLAG))
      val pixels = IntArray(SIZE*SIZE)
      padded.getPixels(pixels, 0, SIZE, 0, 0, SIZE, SIZE)
      val buffer = ByteBuffer.allocateDirect(SIZE*SIZE*3).order(ByteOrder.nativeOrder())
      for (pixel in pixels) { buffer.put((pixel shr 16).toByte()); buffer.put((pixel shr 8).toByte()); buffer.put(pixel.toByte()) }
      buffer.rewind()
      return Input(buffer, left, top, width.toFloat(), height.toFloat())
    } finally {
      if (resized !== bitmap) resized.recycle()
      padded.recycle()
    }
  }

  private fun decode(uri: Uri): Bitmap {
    require(uri.scheme in listOf("file", "content")) { "Chỉ xử lý ảnh có trên thiết bị." }
    // Bound compressed input before decoding; input never passes through a network client.
    val bytes = context.contentResolver.openInputStream(uri)?.use { stream ->
      val output = ByteArrayOutputStream()
      val chunk = ByteArray(16*1024)
      while (true) {
        val count = stream.read(chunk, 0, min(chunk.size, MAX_BYTES+1-output.size()))
        if (count < 0) break
        if (count == 0) break
        output.write(chunk, 0, count)
        if (output.size() > MAX_BYTES) break
      }
      output.toByteArray()
    } ?: error("Không mở được ảnh. Hãy chọn lại ảnh.")
    require(bytes.size <= MAX_BYTES) { "Ảnh quá lớn. Chọn ảnh không quá 5 MB." }
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)
    require(bounds.outWidth > 0 && bounds.outHeight > 0 && bounds.outMimeType in listOf("image/jpeg", "image/png")) { "Chọn ảnh JPG hoặc PNG hợp lệ." }
    var sample = 1
    while (max(bounds.outWidth, bounds.outHeight)/sample > 1600) sample *= 2
    val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, BitmapFactory.Options().apply { inSampleSize = sample }) ?: error("Không đọc được ảnh.")
    val orientation = runCatching { bytes.inputStream().use { ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL) } }.getOrDefault(ExifInterface.ORIENTATION_NORMAL)
    val matrix = Matrix()
    when (orientation) {
      2 -> matrix.setScale(-1f, 1f)
      3 -> matrix.setRotate(180f)
      4 -> matrix.setScale(1f, -1f)
      5 -> { matrix.setRotate(90f); matrix.postScale(-1f, 1f) }
      6 -> matrix.setRotate(90f)
      7 -> { matrix.setRotate(-90f); matrix.postScale(-1f, 1f) }
      8 -> matrix.setRotate(-90f)
    }
    if (matrix.isIdentity) return bitmap
    return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true).also { if (it !== bitmap) bitmap.recycle() }
  }

  override fun invalidate() { executor.shutdown(); super.invalidate() }
  companion object { const val NAME = "NativeOfflineVision"; private const val SIZE = 320; private const val MAX_BYTES = 5*1024*1024 }
}
