package com.lenvocab.app.offline

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class OfflineVisionPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == OfflineVisionModule.NAME) OfflineVisionModule(reactContext) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(OfflineVisionModule.NAME to ReactModuleInfo(OfflineVisionModule.NAME, OfflineVisionModule.NAME, false, false, false, true))
  }
}
