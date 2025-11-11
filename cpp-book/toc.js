// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="index.html">Introduction</a></li><li class="chapter-item expanded "><a href="standards/index.html"><strong aria-hidden="true">1.</strong> C++ Standards</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="standards/declarations/index.html"><strong aria-hidden="true">1.1.</strong> Declarations</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="standards/declarations/initializers.html"><strong aria-hidden="true">1.1.1.</strong> Initializers</a></li></ol></li></ol></li><li class="chapter-item expanded "><a href="algorithms/index.html"><strong aria-hidden="true">2.</strong> Competitive Programming</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="algorithms/sort.html"><strong aria-hidden="true">2.1.</strong> Sort</a></li><li class="chapter-item expanded "><a href="algorithms/queue.html"><strong aria-hidden="true">2.2.</strong> Queue</a></li><li class="chapter-item expanded "><a href="algorithms/graph/index.html"><strong aria-hidden="true">2.3.</strong> Tree, Graph</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="algorithms/graph/segment_tree.html"><strong aria-hidden="true">2.3.1.</strong> Segment Tree</a></li><li class="chapter-item expanded "><a href="algorithms/graph/fenwick_tree.html"><strong aria-hidden="true">2.3.2.</strong> Fenwick Tree</a></li><li class="chapter-item expanded "><a href="algorithms/graph/pbds.html"><strong aria-hidden="true">2.3.3.</strong> Policy-Based Data Structures</a></li><li class="chapter-item expanded "><a href="algorithms/graph/trie.html"><strong aria-hidden="true">2.3.4.</strong> Trie</a></li><li class="chapter-item expanded "><a href="algorithms/graph/union-find.html"><strong aria-hidden="true">2.3.5.</strong> Union-Find</a></li></ol></li><li class="chapter-item expanded "><a href="algorithms/search.html"><strong aria-hidden="true">2.4.</strong> Binary Search</a></li><li class="chapter-item expanded "><a href="algorithms/string/index.html"><strong aria-hidden="true">2.5.</strong> String</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="algorithms/string/kmp.html"><strong aria-hidden="true">2.5.1.</strong> kmp</a></li><li class="chapter-item expanded "><a href="algorithms/string/Boyer-Moore.html"><strong aria-hidden="true">2.5.2.</strong> Boyer–Moore</a></li><li class="chapter-item expanded "><a href="algorithms/string/z-algorithm.html"><strong aria-hidden="true">2.5.3.</strong> Z algorithm</a></li></ol></li><li class="chapter-item expanded "><a href="algorithms/hash.html"><strong aria-hidden="true">2.6.</strong> Hash</a></li><li class="chapter-item expanded "><a href="algorithms/math/index.html"><strong aria-hidden="true">2.7.</strong> Math</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="algorithms/math/utility.html"><strong aria-hidden="true">2.7.1.</strong> Utility Functions</a></li><li class="chapter-item expanded "><a href="algorithms/math/incl-excl.html"><strong aria-hidden="true">2.7.2.</strong> Inclusion-Exclusion Principle</a></li></ol></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
