import { generateText, Output } from 'ai'
import { z } from 'zod'
import { sampleObjects, scenes } from '@/lib/lenvocab-data'

export const maxDuration = 60

const detectionSchema = z.object({
  objects: z.array(z.object({
    term: z.string().min(1).max(48),
    meaning: z.string().min(1).max(80),
    note: z.string().min(1).max(240),
    box: z.object({
      x1: z.number().min(0).max(1000),
      y1: z.number().min(0).max(1000),
      x2: z.number().min(0).max(1000),
      y2: z.number().min(0).max(1000),
    }),
  })).max(5),
})

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const image = form.get('image')
    let data: Buffer
    let mediaType: 'image/jpeg' | 'image/png' | 'image/webp'

    if (image instanceof File) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type) || image.size > 8 * 1024 * 1024 || image.size === 0) {
        return Response.json({ error: 'Vui lòng chọn ảnh JPG, PNG hoặc WebP dưới 8 MB.' }, { status: 400 })
      }
      data = Buffer.from(await image.arrayBuffer())
      mediaType = image.type as typeof mediaType
    } else {
      const scene = scenes.find(item => item.id === form.get('sceneId'))
      if (!scene) return Response.json({ error: 'Không tìm thấy ảnh để quét.' }, { status: 400 })
      return Response.json({ objects: sampleObjects[scene.id], sample: true })
    }

    const { output } = await generateText({
      model: 'google/gemini-2.5-flash',
      output: Output.object({ schema: detectionSchema }),
      instructions: 'You are an image object detector and an English vocabulary tutor. Analyze only objects truly visible in the attached photo. Return up to five distinct, clearly visible, concrete objects. Do not invent objects to fill a quota. Use English for term (lowercase); Vietnamese for meaning and note. Each note is a short, useful Vietnamese observation or memory aid about this specific object, not a generic filler sentence. The box is a tight bounding rectangle around the object using image coordinates scaled 0 to 1000, with top-left x1/y1 and bottom-right x2/y2. Each object must have its own box; do not label the whole photo or background. If nothing is identifiable return an empty array.',
      messages: [{ role: 'user', content: [
        { type: 'text', text: 'Find up to five prominent objects in this image. Give each object an accurate bounding box, English word, Vietnamese meaning and separate learning note.' },
        { type: 'file', mediaType, data },
      ] }],
    })

    const objects = output.objects.filter(({ box }) => box.x2 > box.x1 && box.y2 > box.y1)
    return Response.json({ objects })
  } catch (error) {
    console.error('Image scan failed', error)
    const gatewayError = error as { statusCode?: number; message?: string }
    if (gatewayError.statusCode === 403 && gatewayError.message?.includes('valid credit card')) {
      return Response.json({ error: 'AI Gateway cần xác minh thẻ thanh toán trên Vercel để nhận diện ảnh của bạn. Bạn vẫn có thể thử 4 cảnh mẫu.' }, { status: 503 })
    }
    return Response.json({ error: 'Không thể phân tích ảnh lúc này. Vui lòng thử lại.' }, { status: 500 })
  }
}
