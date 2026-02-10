
import streamlit as st
import streamlit.components.v1 as components
import os

# Set page title and favicon
st.set_page_config(
    page_title="La Paris AI Studio",
    page_icon="🥐",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit header/footer for a pure "App" feel
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            #root > div:nth-child(1) > div > div > div > div > section > div {padding-top: 0rem;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

def main():
    # 1. Get the API Key from Streamlit Secrets
    api_key = st.secrets.get("API_KEY", "")
    
    if not api_key:
        st.error("Missing API_KEY in Streamlit Secrets. Please add it to the app settings.")
        return

    # 2. Read the index.html file
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        # 3. Inject the API Key into the window object so the React app can find it
        # We replace a placeholder or just prepend it to the head
        injection_script = f"""
        <script>
            window.process = {{ env: {{ API_KEY: "{api_key}" }} }};
        </script>
        """
        html_content = html_content.replace("<head>", f"<head>{injection_script}")

        # 4. Render the HTML component
        # We set height to a large value or use a calculation
        components.html(html_content, height=1000, scrolling=False)
        
        st.info("Note: For the best experience, use the app in a desktop browser.")
        
    except FileNotFoundError:
        st.error("index.html not found in the root directory.")

if __name__ == "__main__":
    main()
