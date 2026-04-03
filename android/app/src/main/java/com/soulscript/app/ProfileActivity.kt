package com.soulscript.app

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar

class ProfileActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        // Setup Toolbar
        val toolbar: Toolbar = findViewById(R.id.profileToolbar)
        toolbar.setNavigationOnClickListener {
             finish() // Return to webview
        }

        // Get user data from intent (Requirement 12)
        val name = intent.getStringExtra("USER_NAME") ?: "Brother in Faith"
        val email = intent.getStringExtra("USER_EMAIL") ?: "soulscript.user@heaven.app"

        findViewById<TextView>(R.id.txtUserName).text = name
        findViewById<TextView>(R.id.txtUserEmail).text = email

        // Native Logout logic
        findViewById<Button>(R.id.btnNativeLogout).setOnClickListener {
             // Logic to clear local storage syncing with web could go here
             finish()
        }
    }
}
