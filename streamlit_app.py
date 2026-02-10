
import streamlit as st
import streamlit.components.v1 as components
import os
import re

# Set page title and favicon
st.set_page_config(
    page_title="La Paris AI Studio",
    page_icon="🥐",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit UI elements for a pure "Studio" feel
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {padding: 0px !important;}
    iframe {border: none !important;}
    </style>
    """, unsafe_allow_html=True)

def get_file_content(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except:
        return ""

def main():
    # 1. Handle Secrets and provide clear guidance for TomlDecodeError
    try:
        if "API_KEY" in st.secrets:
            api_key = st.secrets["API_KEY"]
        else:
            st.warning("⚠️ API Key not found in Streamlit Secrets.")
            st.markdown("""
            ### How to fix:
            1. Go to your **Streamlit Cloud Dashboard**.
            2. Find this app and click **Settings** > **Secrets**.
            3. Paste the following (ensuring the quotes are exactly as shown):
               ```toml
               API_KEY = "your-google-gemini-api-key"
               ```
            4. **Save** and the app will restart.
            """)
            st.stop()
    except Exception as e:
        st.error(f"Error reading secrets: {str(e)}")
        st.info("Ensure your Secrets are formatted correctly as TOML: `KEY = \"VALUE\"` (use double quotes).")
        st.stop()

    # 2. Bundle the React App
    # We read all source files and inject them into index.html to avoid relative path issues in the iframe.
    index_html = get_file_content("index.html")
    app_tsx = get_file_content("App.tsx")
    index_tsx = get_file_content("index.tsx")
    types_ts = get_file_content("types.ts")
    gemini_service = get_file_content("services/geminiService.ts")
    logo_component = get_file_content("components/Logo.tsx")
    card_component = get_file_content("components/ProcessingCard.tsx")

    # Clean local imports so Babel can treat it as one execution context
    def clean_imports(content):
        # Remove relative imports (./ or ../) as we are inlining everything
        content = re.sub(r'import\s+.*\s+from\s+["\']\./.*["\'];?', '', content)
        content = re.sub(r'import\s+.*\s+from\s+["\']\.\./.*["\'];?', '', content)
        # Ensure 'export' keywords don't break Babel's module execution if not needed
        return content

    # 3. Inject Everything into index.html
    # We add Babel for on-the-fly transpilation of TSX/TS in the browser
    # We also inject the API key directly into the process.env object
    injection = f"""
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script>
        window.process = {{ env: {{ API_KEY: "{api_key}" }} }};
    </script>
    
    <script type="text/babel" data-type="module">
        // --- types.ts ---
        {clean_imports(types_ts)}

        // --- services/geminiService.ts ---
        {clean_imports(gemini_service)}

        // --- components/Logo.tsx ---
        {clean_imports(logo_component)}

        // --- components/ProcessingCard.tsx ---
        {clean_imports(card_component)}

        // --- App.tsx ---
        {clean_imports(app_tsx)}

        // --- index.tsx ---
        {clean_imports(index_tsx)}
    </script>
    """
    
    # Inject the scripts into the HTML
    if "</body>" in index_html:
        final_html = index_html.replace("</body>", f"{injection}</body>")
    else:
        final_html = index_html + injection

    # 4. Render as a high-performance full-screen component
    components.html(final_html, height=1000, scrolling=True)

if __name__ == "__main__":
    main()
