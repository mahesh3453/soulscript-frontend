package com.soulscript.app

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.Button
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

/**
 * DEFENITIVE STABILIZED MAIN ACTIVITY
 * 1. Resolves Startup Crash by unifying Material Engine
 * 2. Implements 100% Stable WebView Wrapper
 * 3. Handles Offline States and Native Bridges
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineLayout: View
    private val liveUrl = "https://soulscript-frontend.vercel.app/"

    override fun onCreate(savedInstanceState: Bundle?) {
        // 1. MUST INITIALIZE SPLASH SCREEN BEFORE SUPER.ONCREATE
        // This hand-off is the industry standard for modern Android stability.
        installSplashScreen()
        
        super.onCreate(savedInstanceState)
        
        // 2. Inflate the Native UI
        // Note: This requires a MaterialComponents theme in styles.xml
        setContentView(R.layout.activity_main)

        // 3. Bind UI Components
        setupNativeToolbar()
        
        webView = findViewById(R.id.webView)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)
        offlineLayout = findViewById(R.id.offlineLayout)

        // 4. Initialize WebView with Extreme Stability
        initializeWebView()
        setupRefreshLogic()

        // 5. Check Connection and Start SoulScript
        loadInitialPage()
    }

    private fun setupNativeToolbar() {
        val toolbar: Toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.title = "SoulScript"
    }

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    private fun initializeWebView() {
        val settings = webView.settings
        
        // Requirements: Stable JS and Storage
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.setSupportZoom(false)
        
        // Security & Cookies
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
        
        // Essential Native Bridge for Profile
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")

        // Robust Client Handlers (Prevents Blank Screen)
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                progressBar.visibility = View.VISIBLE
                progressBar.progress = 0
                offlineLayout.visibility = View.GONE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
                webView.visibility = View.VISIBLE
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                // Show offline screen for the main SoulScript domain failures
                if (request?.isForMainFrame == true) {
                    showOfflineUi()
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress >= 100) {
                    progressBar.visibility = View.GONE
                }
            }
        }
    }

    private fun setupRefreshLogic() {
        swipeRefresh.setColorSchemeColors(Color.parseColor("#6d28d9"))
        swipeRefresh.setOnRefreshListener {
            webView.reload()
        }
        
        // Retry button on the offline UI
        findViewById<Button>(R.id.btnRetry).setOnClickListener {
            loadInitialPage()
        }
    }

    private fun loadInitialPage() {
        if (isNetworkConnected()) {
            webView.loadUrl(liveUrl)
            offlineLayout.visibility = View.GONE
            webView.visibility = View.VISIBLE
        } else {
            showOfflineUi()
        }
    }

    private fun showOfflineUi() {
        webView.visibility = View.GONE
        offlineLayout.visibility = View.VISIBLE
        swipeRefresh.isRefreshing = false
    }

    private fun isNetworkConnected(): Boolean {
        val cm = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val n = cm.activeNetwork ?: return false
        val nc = cm.getNetworkCapabilities(n) ?: return false
        return nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    /**
     * Cross-Activity Native Bridge for Professional Navigation
     */
    inner class AndroidBridge {
        @JavascriptInterface
        fun openNativeProfile(name: String?, email: String?) {
            val intent = Intent(this@MainActivity, ProfileActivity::class.java)
            intent.putExtra("USER_NAME", name)
            intent.putExtra("USER_EMAIL", email)
            startActivity(intent)
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
