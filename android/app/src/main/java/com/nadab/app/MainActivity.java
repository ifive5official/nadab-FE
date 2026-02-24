package com.nadab.app;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import android.graphics.Color;
import android.os.Build;
import android.view.WindowManager;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ThemeManagerPlugin.class);

        super.onCreate(savedInstanceState);

        // 상단바 하단바 투명 설정
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        // 안드로이드 10(API 29) 이상에서 시스템이 강제로 넣는 반투명 배경(Scrim) 제거
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setNavigationBarContrastEnforced(false);
            getWindow().setStatusBarContrastEnforced(false);
        }

        // 2. 루트 뷰(웹뷰를 담고 있는 그릇)를 찾습니다.
        View root = findViewById(android.R.id.content);

        // 상단바 색상
//        root.setBackgroundColor(Color.parseColor("#000000"));

        // 3. 상단바의 높이를 실시간으로 계산해서 패딩을 줍니다.
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());

            // 상단바(top)만큼 패딩을 강제로 삽입 - 하단바 제외
            // 이렇게 하면 웹뷰는 절대로 이 영역 안으로 들어갈 수 없습니다.
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0);

            return insets;
        });
    }
}