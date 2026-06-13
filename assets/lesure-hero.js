/* Lesure Hero JavaScript */

// Define galleryMove globally so it can be accessed by HTML onclick attributes
window.galleryMove = function(dir) {
  // This will be overwritten once DOM is loaded, but ensures no ReferenceError
};

window.toggleBuyAcc = function(button) {
  const item = button.closest(".buy-acc-item");
  item.classList.toggle("open");
};

document.addEventListener("DOMContentLoaded", function() {
  // --- VARIANT & PRICE LOGIC ---
  const productVariants = window.productVariants || [];
  const selectedOptions = window.selectedOptions || [];
  const shopCurrency = window.Shopify?.currency?.active || "EUR";


function formatMoney(cents) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: shopCurrency
  })
  .format(cents / 100)
  .replace(/\s/g, '');
}

  let galIdx = 0;

  function updateVariant() {

    const matched = productVariants.find(v => {

      if (v.options.length !== selectedOptions.length) {
        return false;
      }

      return v.options.every((opt, i) => {
        return opt === selectedOptions[i];
      });

    });

    const cta = document.getElementById("desktopCta");
    const priceNow = document.getElementById("priceNow");
    const priceWas = document.getElementById("priceWas");
    const priceSave = document.getElementById("priceSave");
    const variantInput = document.getElementById("variantIdInput");

    if (matched) {

      // =========================
      // VARIANT ID
      // =========================

      // if (variantInput) {
      //   variantInput.value = matched.id;
      // }

      // =========================
      // BUTTON STATE
      // =========================

      // if (matched.available) {

      //   if (cta) {

      //     cta.disabled = false;

      //     const btnText = cta.querySelector(".btn-text");

      //     if (btnText) {
      //       btnText.innerText =
      //         "Add to cart — " + formatMoney(matched.price);
      //     }
      //   }

      // } else {

      //   if (cta) {

      //     cta.disabled = true;

      //     const btnText = cta.querySelector(".btn-text");

      //     if (btnText) {
      //       btnText.innerText = "Sold Out";
      //     }
      //   }
      // }

      // =========================
      // PRICE UPDATE
      // =========================

      // if (priceNow) {
      //   priceNow.innerText = formatMoney(matched.price);
      // }

      // if (matched.compare_at_price > matched.price) {

      //   if (priceWas) {
      //     priceWas.innerText = formatMoney(matched.compare_at_price);
      //     priceWas.style.display = "inline";
      //   }

      //   if (priceSave) {

      //     const savePercent = Math.round(
      //       (matched.compare_at_price - matched.price) *
      //       100 /
      //       matched.compare_at_price
      //     );

      //     priceSave.innerText = "Spare " + savePercent + "%";
      //     priceSave.style.display = "inline";
      //   }

      // } else {

      //   if (priceWas) {
      //     priceWas.style.display = "none";
      //   }

      //   if (priceSave) {
      //     priceSave.style.display = "none";
      //   }
      // }

    // =========================================
// ACTIVE GALLERY IMAGE BASED ON VARIANT
// =========================================

if (matched.featured_media) {

  const mediaId = matched.featured_media.id;

  const slides = document.querySelectorAll(".gallery-slide");

  const matchedIndex = Array.from(slides).findIndex(slide => {

    return slide.dataset.mediaId == mediaId;

  });

  if (matchedIndex !== -1) {

    galIdx = matchedIndex;

    updateGallery();
  }
}

} else {

  if (cta) {

    cta.disabled = true;

    const btnText = cta.querySelector(".btn-text");

    if (btnText) {
      btnText.innerText = "Unavailable";
    }
}
    }
  }

  // Handle Button Clicks
  // document.querySelectorAll(".sz").forEach(button => {
  //   button.addEventListener("click", function() {
  //     const optionIndex = parseInt(this.closest(".option-wrapper").dataset.optionIndex);
  //     const value = this.dataset.value;
      
  //     selectedOptions[optionIndex] = value;
      
  //     const wrapper = this.closest(".sizegrid");
  //     wrapper.querySelectorAll(".sz").forEach(b => b.classList.remove("on"));
  //     this.classList.add("on");
      
  //     updateVariant();
  //   });
  // });

  // Handle Dropdown Changes
  // document.querySelectorAll(".bundle-select").forEach(select => {
  //   select.addEventListener("change", function() {
  //     const optionIndex = parseInt(this.dataset.optionIndex);
  //     selectedOptions[optionIndex] = this.value;
  //     updateVariant();
  //   });
  // });

  // --- AJAX ADD TO CART ---
  // const ajaxForm = document.getElementById("product-form-ajax");
  // if (ajaxForm) {
  //   ajaxForm.addEventListener("submit", function(e) {
  //     e.preventDefault();
  //     const cta = document.getElementById("desktopCta");
  //     const btnText = cta.querySelector(".btn-text");
  //     const btnLoader = cta.querySelector(".btn-loader");

  //     if (btnText) btnText.style.display = "none";
  //     if (btnLoader) btnLoader.style.display = "inline";
  //     cta.disabled = true;

  //     const variantId = document.getElementById("variantIdInput").value;

  //     fetch("/cart/add.js", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-Requested-With": "XMLHttpRequest"
  //       },
  //       body: JSON.stringify({
  //         items: [{ id: variantId, quantity: 1 }]
  //       })
  //     })
  //     .then(response => {
  //       if (!response.ok) throw new Error("Cart add failed");
  //       return response.json();
  //     })
  //     .then(data => {
  //       if (btnText) btnText.style.display = "inline";
  //       if (btnLoader) btnLoader.style.display = "none";
  //       cta.disabled = false;
        
  //       // Trigger Cart Drawer
  //       document.dispatchEvent(new CustomEvent("cart:refresh"));
  //       document.dispatchEvent(new CustomEvent("cart:open"));
  //     })
  //     .catch(error => {
  //       console.error("Error:", error);
  //       if (btnText) btnText.style.display = "inline";
  //       if (btnLoader) btnLoader.style.display = "none";
  //       cta.disabled = false;
  //       alert("Error adding to cart. Please try again.");
  //     });
  //   });
  // }

  // --- GALLERY LOGIC ---
  const thumbs = document.querySelectorAll(".thumbrow-inner .thumb");
  const galTotal = thumbs.length;
  const track = document.getElementById("galleryTrack");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");

  function updateGallery() {
    if (track) track.style.transform = "translateX(-" + (galIdx * 100) + "%)";
    
    // Update Arrows visibility
    if (prevBtn) prevBtn.classList.toggle("hidden", galIdx === 0);
    if (nextBtn) nextBtn.classList.toggle("hidden", galIdx === galTotal - 1);
    
    // Update Thumbs
    thumbs.forEach((t, i) => {
      t.classList.toggle("on", i === galIdx);
    });
  }

  window.galleryGoTo = function(idx) {
    galIdx = Math.max(0, Math.min(galTotal - 1, idx));
    updateGallery();
  };

  window.galleryMove = function(dir) {
    if (galTotal === 0) return;
    let newIdx = galIdx + dir;
    if (newIdx >= 0 && newIdx < galTotal) {
      galIdx = newIdx;
      updateGallery();
    }
  };

  thumbs.forEach((t, i) => {
    t.addEventListener("click", () => window.galleryGoTo(i));
  });

  // Touch swipe for gallery
  const slidesContainer = document.getElementById("gallerySlides");
  if (slidesContainer) {
    let startX = 0;
    slidesContainer.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, {passive:true});
    slidesContainer.addEventListener("touchend", e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) window.galleryMove(diff > 0 ? 1 : -1);
    }, {passive:true});
  }

  // --- RESPONSIVE GALLERY SIZING ---
  function sizeGallery() {
    const gallery = document.querySelector(".gallery");
    const imgUnit = document.querySelector(".img-unit");
    if (!gallery || !imgUnit) return;

    if (window.innerWidth <= 960) {
      gallery.style.cssText = "";
      imgUnit.style.cssText = "";
      return;
    }

    const breadcrumb = document.querySelector(".breadcrumb");
    const heroLeft = document.querySelector(".hero-left");
    let buyPadTop = 40;
    if (breadcrumb && heroLeft) {
      const bcRect = breadcrumb.getBoundingClientRect();
      const hlRect = heroLeft.getBoundingClientRect();
      buyPadTop = bcRect.top - hlRect.top;
    }

    const galleryH = window.innerHeight - 52 - 64; 
    gallery.style.height = galleryH + "px";
    gallery.style.paddingTop = buyPadTop + "px";
    
    const thumbRow = document.querySelector(".thumbrow-inner");
    const thumbH = thumbRow ? thumbRow.offsetHeight : 60;
    const availH = galleryH - buyPadTop - 40 - 8 - thumbH;
    const availW = gallery.offsetWidth - 40;
    const imgSide = Math.max(0, Math.min(availH, availW));
    
    imgUnit.style.width = imgSide + "px";
  }

  sizeGallery();
  window.addEventListener("resize", sizeGallery);
  
  // Initial Gallery Update
  updateGallery();
  
  // Initial Variant Update
  updateVariant();
});

// Accordion Toggle Function (global for onclick)
window.toggleBuyAcc = function(button) {
  const item = button.closest(".buy-acc-item");
  item.classList.toggle("open");
};
