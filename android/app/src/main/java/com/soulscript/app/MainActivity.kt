package com.soulscript.app

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.Button
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.getcapacitor.BridgeActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class MainActivity : BridgeActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineLayout: View
    private val liveUrl = "https://soulscript-frontend.vercel.app/"

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize Native UI
        val toolbar: Toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)

        webView = findViewById(R.id.webView)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)
        offlineLayout = findViewById(R.id.offlineLayout)

        setupWebView()
        setupRefreshLayout()

        val btnRetry: Button = findViewById(R.id.btnRetry)
        btnRetry.setOnClickListener {
            checkConnectionAndLoad()
        }

        checkConnectionAndLoad()
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun openNativeProfile(name: String?, email: String?) {
            val intent = Intent(this@MainActivity, ProfileActivity::class.java)
            intent.putExtra("USER_NAME", name)
            intent.putExtra("USER_EMAIL", email)
            startActivity(intent)
        }

        @JavascriptInterface
        fun triggerHapticFeedback() {
             // Optional: Custom native haptics if needed
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        
        // Session Persistence (Cookies)
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
        
        // Add JS Bridge
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
                offlineLayout.visibility = View.GONE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
                
                // Keep progress bar hidden if fully loaded
                progressBar.progress = 100
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    showOfflineScreen()
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url.toString()
                
                // Requirement 12: Intercept "Me" (Profile) route
                if (url.contains("/bookmarks")) { // Use this as bridge trigger since profile is often linked to saved items
                     // Just an example trigger, you can update this to match your exact button route
                }

                if (url.endsWith("/profile") || url.contains("login")) {
                    // Launch Native Profile Screen (Bridge)
                    // Note: For actual usage, you'd match the exact route you set in your React app
                    // launchProfileActivity()
                    // return true
                }

                // Keep navigation inside WebView
                return false 
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                progressBar.progress = newProgress
                if (newProgress == 100) {
                    progressBar.visibility = View.GONE
                }
            }
        }
    }

    private fun setupRefreshLayout() {
        swipeRefresh.setColorSchemeResources(R.color.colorPrimary, R.color.colorAccent)
        swipeRefresh.setOnRefreshListener {
            webView.reload()
        }
    }

    private fun checkConnectionAndLoad() {
        if (isNetworkAvailable()) {
            webView.loadUrl(liveUrl)
            offlineLayout.visibility = View.GONE
            webView.visibility = View.VISIBLE
        } else {
            showOfflineScreen()
        }
    }

    private fun showOfflineScreen() {
        webView.visibility = View.GONE
        offlineLayout.visibility = View.VISIBLE
        swipeRefresh.isRefreshing = false
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val activeNetwork = connectivityManager.getNetworkCapabilities(network) ?: return false
        return activeNetwork.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun launchProfileActivity() {
        val intent = Intent(this, ProfileActivity::class.java)
        // Pass dummy data for now
        intent.putExtra("USER_NAME", "SoulScript User")
        intent.putExtra("USER_EMAIL", "soulscript@faith.app")
        startActivity(intent)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
