const DEFAULT_THRESHOLD_STEPS = 10;
const DEFAULT_THRESHOLD = Array.from({
  length: DEFAULT_THRESHOLD_STEPS + 1
}).map((_, idx) => (idx / DEFAULT_THRESHOLD_STEPS).toFixed(2));

// class wraps each image element that has a data-src attribute
// (this might be a bit presumptuous, should investigate and maybe apply a data-lazy attribute instead)
class LazyImage {
  constructor(imageElement) {
    // ref to the element
    this.$img = imageElement;
    // ref the <sources> nodes
    this.$sources = Array.from(this.$img.parentNode.querySelectorAll("source"));

    this.init();
  }
  /**
   *
   *
   * @memberof LazyImage
   */
  init() {
    this.addIO();
  }

  /**
   * adds the IntersectionObserver functionality for lazy-loading the image
   * gets the rootMargin from the data-rootmargin attribute if present
   * observes the image
   * triggers the image load when the IntersectionObserver has an entry within the threshold
   * @memberof LazyImage
   */
  addIO() {
    this.userRootMargin = this.$img.parentNode.parentNode.dataset.rootmargin;
    this.io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.intersectionRatio > 0) {
            this.io.unobserve(this.$img);
            this.loadImage();
          }
        });
      },
      {
        rootMargin: this.userRootMargin || `400px 300px`,
        root: null,
        threshold: DEFAULT_THRESHOLD,
        delay: 100,
        trackVisibility: true
      }
    );
    this.io.observe(this.$img);
  }

  /**
   * triggers the image laod
   * adds the load listener
   * @memberof LazyImage
   */
  loadImage() {
    this.$img.addEventListener("load", () => {
      this.onLoad();
    });
    this.$sources.forEach($source => {
      $source.setAttribute(`srcset`, $source.dataset.srcset);
      $source.removeAttribute(`data-srcset`);
    });
    this.$img.src = this.$img.dataset.src;
  }

  /**
   * image load handler
   * sets the opacity to 1 and the visibility to "visible" when the image is loaded
   * this allows for the "fadeUp" effect
   * @memberof LazyImage
   */
  onLoad() {
    this.$img.style.visibility = `visible`;
    this.$img.style.opacity = 1;
  }
}

// wrap each image in the LazyImage class to handle lazy loading
const run = () => {
  const allImages = Array.from(document.querySelectorAll("img[data-src]"));
  allImages.forEach(img => new LazyImage(img));
};

const init = () => {
  // wait for the initial page load to initialize LazyImage(s)
  window.addEventListener("load", run);
};

export { init, run };
