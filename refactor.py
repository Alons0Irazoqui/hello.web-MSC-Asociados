import os
import re

html_path = 'index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    style_content = style_match.group(1).strip()
    os.makedirs('css', exist_ok=True)
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(style_content)
    # Replace style block with link
    content = content.replace(style_match.group(0), '<link rel="stylesheet" href="./css/style.css">')

# 2. Extract JS (look for the large script block near the bottom)
scripts = list(re.finditer(r'<script>(.*?)</script>', content, re.DOTALL))
main_script_match = None
for s in scripts:
    # Basic heuristic: if it has addEventListener or setTimeout, it's the main logic
    if 'document.addEventListener' in s.group(1) or 'setTimeout' in s.group(1):
        main_script_match = s

if main_script_match:
    js_content = main_script_match.group(1).strip()
    
    # Append Mobile Menu JS logic
    js_content += """

// MOBILE MENU LOGIC
document.addEventListener('DOMContentLoaded', function() {
    const openMobileMenu = document.getElementById('openMobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (openMobileMenu && closeMobileMenu && mobileMenu) {
        openMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
        });
        closeMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
        });
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
            });
        });
    }
});
"""

    os.makedirs('js', exist_ok=True)
    with open('js/main.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    # Replace script block with external script tag
    content = content.replace(main_script_match.group(0), '<script src="./js/main.js"></script>')

# 3. Add mobile menu HTML and fix hamburger button
old_hamburger = '<button class="md:hidden text-white hover:text-brand-gold focus:outline-none">'
new_hamburger = '<button id="openMobileMenu" class="md:hidden text-white hover:text-brand-gold focus:outline-none">'
content = content.replace(old_hamburger, new_hamburger)

mobile_menu_html = """
        <!-- Mobile Menu Container -->
        <div id="mobileMenu" class="fixed inset-0 bg-brand-navy/98 backdrop-blur-md z-[60] transform translate-x-full transition-transform duration-300 md:hidden flex flex-col items-center justify-center gap-8">
            <button id="closeMobileMenu" class="absolute top-8 right-8 text-white hover:text-brand-gold text-4xl">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <a href="#servicios" class="mobile-link text-white text-2xl hover:text-brand-gold tracking-widest uppercase">Áreas de Práctica</a>
            <a href="#nosotros" class="mobile-link text-white text-2xl hover:text-brand-gold tracking-widest uppercase">Firma</a>
            <a href="#contacto" class="btn-gold border border-brand-gold text-brand-gold px-8 py-3 rounded-sm text-lg uppercase tracking-wider mobile-link mt-4 hover:text-white">Consulta Gratuita</a>
        </div>
    </header>
"""
content = content.replace('</header>', mobile_menu_html)

# 4. Fix Hero pt-20 to pt-40 for overlap
content = re.sub(r'bg-fixed pt-20 overflow-hidden', r'bg-fixed pt-40 lg:pt-48 overflow-hidden', content)

# 5. Fix overlapping with responsive padding if needed
# We look for <div class="max-w-7xl mx-auto px-6 lg:px-8 mt-20 relative z-10"> in hero which holds the content
content = content.replace('mt-20 relative z-10', 'mt-10 lg:mt-20 relative z-10')

# Save modified HTML
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactoring complete.")
