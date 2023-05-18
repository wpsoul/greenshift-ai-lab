class CopyButtonPlugin {
    constructor(options = {}) {
      self.hook = options.hook;
      self.callback = options.callback;
      self.lang = "en";
    }
    "after:highlightElement"({ el, result, text }) {
      // Create the copy button and append it to the codeblock...
      
      const language = result?.language ? result.language.toLowerCase() : '';

      if( language === '' ||  el?.dataset?.copy !== "true" || el.parentElement.getElementsByClassName("hljs-code-container").length ){ return; }

      el.dataset.language = language;

      const wrapperEle = document.createElement("div");
      wrapperEle.classList.add("hljs-code-container");
      el.parentElement.appendChild(wrapperEle);

      const langEle = document.createElement("span");
      langEle.classList.add("hljs-language-ele");
      langEle.textContent = language;
      wrapperEle.appendChild(langEle);

      if( language === "javascript" || language === "html" || language === "css" ) {
        let button = Object.assign(document.createElement("button"), {
          innerHTML: "<i class='rhicon rhi-clone'></i> Copy to code area",
          className: "hljs-copy-button",
        });

        button.dataset.copied = false;
       
        el.parentElement.classList.add("hljs-code-wrapper");
        
        wrapperEle.appendChild(button);
    
        // Add a custom proprety to the code block so that the copy button can reference and match its background-color value.
        el.parentElement.style.setProperty(
          "--hljs-theme-background",
          window.getComputedStyle(el).backgroundColor
        );
    
        button.onclick = function () {
          let newText = text;
          if (typeof callback === "function") return callback( newText, el, button );
          
          // copy to clipboard function temporarily disabled if required will use this.
          // if (!navigator.clipboard) { return; }
    
          // navigator.clipboard.writeText(newText).then(function () {
          //     button.innerHTML = "Copied to Clipboard!";
          //     button.dataset.copied = true;
  
          //     setTimeout(() => {
          //       button.innerHTML = "Copy to code area";
          //       button.dataset.copied = false;             
          //     }, 2000);
          // })
        };
      }
    }
  }
  
  export default CopyButtonPlugin;