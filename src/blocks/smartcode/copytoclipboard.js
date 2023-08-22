class CopyButtonPlugin {
	constructor(options = {}) {
		self.hook = options.hook;
		self.callback = options.callback;
		self.lang = "en";
	}
	"after:highlightElement"({ el, result, text }) {
		// Create the copy button and append it to the codeblock...

		if(result.language === undefined) return;

		const language = result.language.toLowerCase();

		el.dataset.language = language;

		if (el?.dataset?.copy !== "true") { return; }

		if (el.parentElement.getElementsByClassName("hljs-code-container").length) { return; }

		const wrapperEle = document.createElement("div");
		wrapperEle.classList.add("hljs-code-container");
		el.parentElement.prepend(wrapperEle);

		const langEle = document.createElement("span");
		langEle.classList.add("hljs-language-ele");
		langEle.textContent = language;
		const btnEle = document.createElement("span");
		wrapperEle.appendChild(langEle);
		wrapperEle.appendChild(btnEle);

		if (language === "javascript" || language === "html" || language === "xml" || language === "css" || language === "js" || language === "php") {
			let button = Object.assign(document.createElement("button"), {
				innerHTML: "<i class='rhicon rhi-clone'></i> Append to code area",
				className: "hljs-copy-button",
			});
			let buttonreplace = Object.assign(document.createElement("button"), {
				innerHTML: "<i class='rhicon rhi-arrow-right'></i> Replace in code area",
				className: "hljs-copy-button",
			});

			button.dataset.copied = false;
			buttonreplace.dataset.copied = false;

			button.dataset.type = "add";
			buttonreplace.dataset.type = "replace";

			el.parentElement.classList.add("hljs-code-wrapper");

			btnEle.appendChild(button);
			btnEle.appendChild(buttonreplace);

			// Add a custom proprety to the code block so that the copy button can reference and match its background-color value.
			el.parentElement.style.setProperty(
				"--hljs-theme-background",
				window.getComputedStyle(el).backgroundColor
			);

			button.onclick = function () {
				let newText = text;
				if (typeof callback === "function") return callback(newText, el, button);
			};
			buttonreplace.onclick = function () {
				let newText = text;
				if (typeof callback === "function") return callback(newText, el, buttonreplace);
			};
		}
	}
}

export default CopyButtonPlugin;