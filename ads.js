/**
 * ==============================================================================
 * CENTRAL DIRECT LINK & ADS MANAGER (TheRock Tech - therock.biz.id)
 * ==============================================================================
 * Mengontrol Direct Link iklan untuk Beranda dan SEMUA 147 Halaman Artikel.
 * ==============================================================================
 */

// 1. URL DIRECT LINK IKLAN:
const DIRECT_LINK_URL = "https://tutaniaunfastrothermuck.com/M6rGl90fb3b0d4cb493085b8b22b4a24cce7095a43604?q={QUERY}";

// 2. KONFIGURASI PERILAKU:
const CONFIG = {
    // Arahkan ke direct link begitu pengunjung mengklik link/kartu artikel
    redirectOnArticleClick: true,

    // Jika pengunjung langsung membuka halaman artikel (misal dari Google/sosmed),
    // otomatis dialihkan juga ke direct link
    redirectIfInsideArticle: true,
    articleOpenDelayMs: 0, // 0 = instan

    // Opsi target buka:
    // false = buka di tab yang sama (langsung masuk ke iklan)
    // true = buka di tab baru
    openInNewTab: false
};

// ==============================================================================
// SISTEM ENGINE INTERCEPTOR & DIRECT LINK
// ==============================================================================
(function () {
    if (!DIRECT_LINK_URL) return;

    // Helper untuk membuat URL final dengan query yang relevan
    function buildAdUrl(keyword) {
        let cleanKeyword = (keyword || "Technology").trim();
        return DIRECT_LINK_URL.replace("{QUERY}", encodeURIComponent(cleanKeyword));
    }

    // Helper untuk mendeteksi keyword dari elemen link/kartu artikel yang diklik
    function getKeywordFromElement(linkElement) {
        // 1. Cari badge kategori di dalam kartu/elemen terdekat
        const container = linkElement.closest(".hero-section, .trending-item, .category-card, .rek-card, .article-header, div");
        if (container) {
            const badge = container.querySelector(".category-badge, .cat");
            if (badge && badge.textContent.trim()) {
                return badge.textContent.trim();
            }
        }

        // 2. Cari alt gambar jika link berupa gambar
        const img = linkElement.querySelector("img");
        if (img && img.getAttribute("alt")) {
            return img.getAttribute("alt");
        }

        // 3. Gunakan teks link atau heading di dalamnya
        const text = linkElement.textContent.trim();
        if (text && text.length > 2 && text.length < 120) {
            return text;
        }

        return "Technology";
    }

    // Navigasi ke URL iklan
    function navigateToAd(targetUrl) {
        if (CONFIG.openInNewTab) {
            window.open(targetUrl, "_blank");
        } else {
            window.location.href = targetUrl;
        }
    }

    // --------------------------------------------------------------------------
    // A. INTERCEPT KLIK PADA LINK ARTIKEL (Beranda & seluruh halaman)
    // --------------------------------------------------------------------------
    if (CONFIG.redirectOnArticleClick) {
        document.addEventListener("click", function (e) {
            // Cek apakah elemen yang diklik adalah link <a> atau berada di dalam <a>
            const link = e.target.closest("a");
            if (!link) return;

            const href = link.getAttribute("href") || "";

            // Deteksi apakah link tersebut mengarah ke artikel (articles/article*.html atau mengandung article)
            const isArticleLink = href.includes("articles/") || 
                                  href.includes("article") || 
                                  (href.endsWith(".html") && !href.includes("index.html"));

            if (isArticleLink) {
                // Cegah pembukaan artikel biasa
                e.preventDefault();
                e.stopPropagation();

                // Ambil keyword dari artikel yang diklik
                const keyword = getKeywordFromElement(link);
                const adUrl = buildAdUrl(keyword);

                // Langsung masuk ke direct link iklan!
                navigateToAd(adUrl);
            }
        }, true);
    }

    // --------------------------------------------------------------------------
    // B. AUTO REDIRECT JIKA PENGUNJUNG MEMBUKA HALAMAN ARTIKEL SECARA LANGSUNG
    // --------------------------------------------------------------------------
    const isInsideArticlePage = window.location.pathname.includes("articles/") || 
                                window.location.pathname.includes("article");

    if (CONFIG.redirectIfInsideArticle && isInsideArticlePage) {
        // Ambil topik dari halaman artikel ini
        let articleKeyword = "Technology";
        const badge = document.querySelector(".category-badge");
        const h1 = document.querySelector("h1");

        if (badge && badge.textContent.trim()) {
            articleKeyword = badge.textContent.trim();
        } else if (h1 && h1.textContent.trim()) {
            articleKeyword = h1.textContent.trim();
        } else if (document.title) {
            articleKeyword = document.title.split("|")[0].trim();
        }

        const adUrl = buildAdUrl(articleKeyword);

        if (CONFIG.articleOpenDelayMs > 0) {
            setTimeout(function () {
                window.location.replace(adUrl);
            }, CONFIG.articleOpenDelayMs);
        } else {
            window.location.replace(adUrl);
        }
    }
})();
