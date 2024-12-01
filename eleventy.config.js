import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginNavigation from "@11ty/eleventy-navigation";

export default function (eleventyConfig) {
    // Copy the contents of the `assets` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
    eleventyConfig.addPassthroughCopy("src/assets/css/");
	eleventyConfig.addPassthroughCopy("src/assets/images/favicon.png");

    // Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

    // Adds code highlight and navigation plugins
	eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(pluginNavigation);

    // Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// File extensions to process in _site folder
		extensions: "html",

		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		defaultAttributes: {
			// e.g. <img loading decoding> assigned on the HTML tag will override these values.
			loading: "lazy",
			decoding: "async",
		}
	});

    return {
        dir: {
            input: "src",
            data: "_data",
            includes: "_includes",
            layouts: "_layouts"
        }
    };
};