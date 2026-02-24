package com.nadab.app;

import android.graphics.Color;
import android.view.View;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.util.Log;

@CapacitorPlugin(name = "ThemeManager")
public class ThemeManagerPlugin extends Plugin {
    @PluginMethod
    public void setRootBackgroundColor(PluginCall call) {
        String color = call.getString("color", "#ffffff"); // 기본값 검정
        Log.d("ThemeManager", "JS에서 넘겨준 색상: " + color);
        getActivity().runOnUiThread(() -> {
            try {
                View root = getActivity().findViewById(android.R.id.content);
                if (root != null) {
                    Log.d("ThemeManager", "Root 뷰를 찾았습니다. 색상을 변경합니다.");
                    root.setBackgroundColor(Color.parseColor(color));
                    call.resolve();
                } else {
                    Log.e("ThemeManager", "Root 뷰를 찾을 수 없습니다!");
                    call.reject("Root view not found");
                }
            } catch (Exception e) {
                Log.e("ThemeManager", "에러 발생: " + e.getMessage());
                call.reject("색상 포맷이 잘못되었습니다: " + color);
            }
        });
    }
}
