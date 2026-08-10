gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);

const version = "3.0.10";
const DEBUG = true; //return to false on prod

let lenis = null;
const lenisLerpValue = 0.165;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const has = (s) => !!nextPage.querySelector(s);

const staggerDefault = 0.05;
const durationDefault = 0.6;

CustomEase.create("default", "0.625, 0.05, 0, 1");
CustomEase.create("linear", "M0,0 C0,0 1,1 1,1")
CustomEase.create("smooth", "M0,0 C0.38,0.005 0.215,1 1,1");
CustomEase.create("outQuad", "M0,0 C0.25,0.46 0.45,0.94 1,1");
CustomEase.create("outQuart", "M0,0 C0.165,0.84 0.44,1 1,1");
CustomEase.create("ease", "M0,0 C0.25,0.1 0.25,1 1,1");
CustomEase.create("easeOut", "M0,0 C0,0 0.58,1 1,1");
CustomEase.create("easeInOut", "M0,0 C0.42,0 0.58,1 1,1");
CustomEase.create("bounce", "M0,0 C0.03,0 0.08,0.02 0.12,0.08 C0.18,0.2 0.22,0.5 0.28,0.85 C0.32,1.05 0.38,1.12 0.45,1.08 C0.52,1.02 0.6,0.98 0.7,1 C0.8,1.02 0.9,1 1,1");
CustomEase.create("power1.inOut", "M0,0 C0.45,0 0.55,1 1,1")
gsap.defaults({ease: "default", duration: durationDefault});


const viewport = {
  tablet: "991px",
  mobileHorizontal: "767px",
  mobileVertical: "479px",
}

const isDesktopLikeDevice = window.matchMedia(
  '(hover: hover) and (pointer: fine)'
).matches;

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    smooth: true,
    lerp: 0.08,
    wheelMultiplier: 1,
    infinite: false,
  });

  history.scrollRestoration = 'manual';

  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  let disableScrollElements = document.querySelectorAll('[scrolldisable-element="disable"]');
  let enableScrollElements = document.querySelectorAll('[scrolldisable-element="enable"]');

  disableScrollElements.forEach(element => {
    element.addEventListener('click', () => {
      lenis.stop();
      // if (DEBUG) console.log("Lenis stopped due to click on", element);
    })
  });

  enableScrollElements.forEach(element => {
    element.addEventListener('click', () => {
      lenis.start();
      // if (DEBUG) console.log("Lenis started due to click on", element);
    })
  });

  // if (DEBUG) console.log("Lenis initialized");

}

function initHighlightText(page) {
  page = page || document;
  const splitHeadingTargets = page.querySelectorAll("[data-highlight-text]");

  splitHeadingTargets.forEach((heading) => {
    const scrollStart = heading.getAttribute("data-highlight-scroll-start") || "top 85%";
    const scrollEnd = heading.getAttribute("data-highlight-scroll-end") || "center 40%";
    const fadedValue = parseFloat(heading.getAttribute("data-highlight-fade")) || 0.2;
    const staggerValue = parseFloat(heading.getAttribute("data-highlight-stagger")) || 0.1;

    new SplitText(heading, {
      type: "words",
      autoSplit: true,
      onSplit(self) {
        const ctx = gsap.context(() => {
          gsap.set(self.words, {
            autoAlpha: fadedValue
          });

          gsap.timeline({
            scrollTrigger: {
              trigger: heading,
              start: scrollStart,
              end: scrollEnd,
              scrub: true,
              invalidateOnRefresh: true
            }
          }).to(self.words, {
            autoAlpha: 1,
            stagger: staggerValue,
            ease: "none"
          });
        });

        return ctx;
      }
    });
  });

  ScrollTrigger.refresh();
}

function initFAQ(page) {
  page = page || document;
  const faqItems = page.querySelectorAll("[data-faq-item]");
  if (faqItems.length === 0) {
    // if (DEBUG) console.log("No FAQ items found");
    return;
  }
  // console.log(faqItems);


  function addKeyboardActivate(element, callback) {
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // Prevent page scroll on Space
        callback(event);
      }
    });
  }

  faqItems.forEach(item => {
    const question = item.querySelector("[data-faq-question]");
    const answer = item.querySelector("[data-faq-answer]");

    if (!question || !answer) return;

    const faqIconWrap = item.querySelector("[data-faq-icon-wrap]");
    const faqIcon = item.querySelector("[data-faq-icon]");
    const faqIconBar = faqIcon?.querySelector("[data-faq-icon-bar]");

    const faqAnimationDuration = 0.25;

    const tl = gsap.timeline({
      paused: true
    });

    tl.to(answer, {
      height: "auto",
      duration: faqAnimationDuration,
      ease: "power1.inOut"
    }, 0)
      .to(faqIconBar, {
        rotationZ: 0,
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0)
      .to(faqIcon, {
        rotationZ: 180,
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0);

    const closeTimeline = gsap.timeline({paused: true});

    closeTimeline.to(answer, {
      height: "0px",
      duration: faqAnimationDuration,
      ease: "power1.inOut"
    }, 0)
      .to(faqIconWrap, {
        // backgroundColor: "blue",
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0)
      .to(faqIconBar, {
        rotationZ: 90,
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0)
      .to(faqIcon, {
        rotationZ: -180,
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0);

    // Set initial state
    closeTimeline.restart();

    function toggleFAQ() {

      let isOpen = item.getAttribute("data-faq-open") === "true";

      if (isOpen) {

        tl.reverse();

        item.setAttribute("data-faq-open", "false");
        item.setAttribute("aria-expanded", "false");

        // if (DEBUG) console.log("FAQ item closed:", question.textContent.trim(), item.getAttribute("data-faq-open"));

      } else {

        tl.restart();

        item.setAttribute("data-faq-open", "true");
        item.setAttribute("aria-expanded", "true");

        // if (DEBUG) console.log("FAQ item opened:", question.textContent.trim(), item.getAttribute("data-faq-open"));

      }
    }

    question.addEventListener("click", toggleFAQ);
    addKeyboardActivate(question, toggleFAQ);

  });

  // if (DEBUG) console.log("FAQ initialized");

}

function initFAQWraps(page) {
  page = page || document;
  const blocks = page.querySelectorAll('[data-faq-block]');
  if (blocks.length === 0) return;

  const wraps = page.querySelectorAll('[data-faq-wrap]');
  if (wraps.length === 0) return;

  wraps.forEach((wrap) => {
    const value = wrap.getAttribute('data-faq-wrap');

    const targetBlock = page.querySelector(
      `[data-faq-block="${value}"]`
    );

    if (targetBlock) {
      targetBlock.appendChild(wrap);
    }
  });

  document.querySelectorAll("[data-faq-tabs]").forEach((tabs) => {
    const tabLinks = [...tabs.querySelectorAll("[data-tab-link]")];
    const tabPanels = [...tabs.querySelectorAll("[data-tab-pane]")];

    tabLinks.forEach((tab, i) => {
      const panel = tabPanels[i];

      const tabId = `tab-${i}`;
      const panelId = `panel-${i}`;

      tab.id = tabId;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panelId);

      panel.id = panelId;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);

      tab.tabIndex = i === 0 ? 0 : -1;
      tab.setAttribute("aria-selected", i === 0);
    });

    tabLinks.forEach((tab, index) => {
      tab.addEventListener("keydown", (e) => {
        let next;

        if (next !== undefined) {
          e.preventDefault();

          tabLinks[next].focus();
          tabLinks[next].click();
        }
      });

      tab.addEventListener("click", () => {
        tabLinks.forEach((t, i) => {
          const active = i === index;

          t.tabIndex = active ? 0 : -1;
          t.setAttribute("aria-selected", active);
        });
      });
    });
  });
}

function initHelpCenter(page) {
  page = page || document;
  const tabs = page.querySelectorAll('[data-tabs-wrap]');
  if (tabs.length === 0) return;

  const wraps = page.querySelectorAll('[data-faq-tabs]');
  if (wraps.length === 0) return;

  wraps.forEach((wrap) => {
    const value = wrap.getAttribute('data-faq-tabs');

    const targetBlock = page.querySelector(
      `[data-tabs-wrap="${value}"]`
    );

    if (targetBlock) {
      targetBlock.appendChild(wrap);
    }
  });
}

Number.prototype.numberFormat = function (e, t, n) {
  t = void 0 !== t ? t : ".", n = void 0 !== n ? n : ",";
  var r = this.toFixed(e).split(".");
  return r[0] = r[0].replace(/\B(?=(\d{3})+(?!\d))/g, n), r.join(t)
};

function isMobileOrTablet() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  const mobileRegex = /android|iphone|ipod|blackberry|iemobile|opera mini/i;
  const tabletRegex = /ipad|tablet|kindle|playbook|silk/i;

  const isMobile = mobileRegex.test(ua);
  const isTablet = tabletRegex.test(ua);

  // Fallback: treat small screens as mobile/tablet
  // const isSmallScreen = window.matchMedia("(max-width: 991px)").matches;
  const isSmallScreen = window.matchMedia(`(max-width: ${viewport.tablet})`).matches;

  return isMobile || isTablet || isSmallScreen;
}
function canHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function initCounters() {
  const targets = document.querySelectorAll('[data-counter]');
  if (targets.length === 0) return;
  const counterTrigger = document.querySelector('[data-counter-trigger]');

  targets.forEach((target) => {
    const targetNumber = target.getAttribute("data-counter");
    const animationDuration = parseInt(target.getAttribute("data-animation-duration")) || 2;
    // if (DEBUG) console.log(target, targetNumber);
    var e = {
      var: 0
    };
    gsap.to(e, animationDuration, {
      var: targetNumber,
      onUpdate: function () {
        let t = e.var.numberFormat(0);
        target.innerHTML = t
      },
      ease: Linear.easeNone,
      scrollTrigger: {
        // trigger: counterTrigger,
        trigger: target,
        start: "top 66%",
        // end: "bottom top",
        // markers: DEBUG,
      }
    })
  });
}

function initPageBlurAnimation() {
  const bottomBlur = document.querySelector("[data-blur-bottom]");

  if (!bottomBlur) return;

  const state = {
    footerProgress: 0,
  };

  function renderBlur() {
    const maxBlur = 3;

    const bottomValue = maxBlur * (1 - state.footerProgress);

    gsap.set(bottomBlur, {
      "--blur-bottom": `${bottomValue}rem`,
    });
  }

  // Start fully blurred
  gsap.set(bottomBlur, {
    "--blur-bottom": "3rem",
  });

  const footer = document.querySelector("[data-footer]");

  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        state.footerProgress = self.progress;
        renderBlur();
      },
      // markers: DEBUG,
    });
  }

  // if (DEBUG) console.log("page blur initialized");
}

// const page = document.querySelector('[data-page-wrap]');
const main = document.querySelector('main');
const loaderContainer = document.querySelector('[data-loader-container]');
const loader = document.querySelector('[data-loader]');

function loadPage() {

  let salesPageFlag = false;
  const videoGlow = document.querySelector('[data-video-glow]');

  const tl = gsap.timeline();

  gsap.matchMedia().add("(min-width: 992px)", () => {

    if (videoGlow) {
      salesPageFlag = true;
    }

  });

  
  if (videoGlow && salesPageFlag) { //sales page load

    gsap.set(videoGlow, {
      scale: .66,
    })

    tl
      .to(loader, {
        autoAlpha: 0,
        duration: .3,
        ease: "outQuad",
      }, 0.5)
      .to(loaderContainer, {
        autoAlpha: 0,
        duration: .3,
        ease: "outQuad",
      }, 0.8)
      .to(videoGlow, {
        scale: 1,
        duration: .35,
        ease: "easeOut",
      }, 1)
      .set(loaderContainer, {
        display: "none",
      }, 1.25);

    if (DEBUG) console.log("Sales Page loaded");

  } else { //regular page load

    tl
      .to(loader, {
        autoAlpha: 0,
        duration: .25,
        ease: "outQuad",
      }, 0.5)
      .to(loaderContainer, {
        autoAlpha: 0,
        duration: .5,
        ease: "outQuad",
      }, 0.75)
      .set(loaderContainer, {
        display: "none",
      }, 1.25);

    if (DEBUG) console.log("Page loaded");

  }

}

function afterLoadHeroIntro(page) {
  page = page || document;
  const section = page.querySelector('[data-animate-section-after-load]');
  if (!section) return;
  const content = section.querySelector('[data-animate-section-content-after-load]');
  if (!content) return;

  gsap.set(content, {opacity: 0, y: "1.5rem"})

  gsap.to(content, {opacity: 1, y: "0rem", delay: 1.25, duration: 0.2, ease: "easeOut"});
}

function afterHeroIntro(page) {
  page = page || document;
  const section = page.querySelector('[data-animate-after-hero]');
  if (!section) return;

  gsap.set(section, {opacity: 0, y: "1.5rem"})

  gsap.to(section, {opacity: 1, y: "0rem", delay: 1.35, duration: 0.2, ease: "easeOut"});
}

// popups
function initPopup(index, page) {
  page = page || document;
  const popupTriggers = page.querySelectorAll(`[data-show-popup-${index}]`);
  if (popupTriggers.length === 0) return;

  function removeTriggers() {
    popupTriggers.forEach(trigger => {
      trigger.remove();
    });
  }

  const popup = page.querySelector(`[data-popup-${index}]`);
  if (!popup) {
    removeTriggers();
    return;
  }

  const background = popup.querySelector('[data-popup-background]');
  if (!background) return;

  const player = page.querySelector(`[data-popup-video="video${index}"]`);
  if (!player) {
    removeTriggers();
    return;
  }

  const openPopup = () => {
    const tl = gsap.timeline();

    tl.set(popup, {
      top: "0vh",
      height: "100vh",
    });

    tl.to(popup, {
      backdropFilter: 'blur(24px)',
      autoAlpha: 1,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const closePopup = () => {
    player.pause();

    const tl = gsap.timeline();

    tl.to(popup, {
      backdropFilter: 'blur(0px)',
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.inOut',
    }, 0);

    tl.set(popup, {
      top: "500vh",
      height: "0vh",
    }, 0.4);
  };

  popupTriggers.forEach(trigger => {
    trigger.addEventListener('click', openPopup);
  });

  background.addEventListener('click', closePopup);
}

// pricing toggle
function initPricingToggle(page) {
  page = page || document;
  const groups = page.querySelectorAll("[data-pricing-toggle-group]");
  if (!groups.length) return;

  const styles = getComputedStyle(document.documentElement);
  const option2Offset = styles.getPropertyValue("--option-2--toggle-offset").trim();
  const toggleGreen = styles.getPropertyValue("--color--green").trim();
  const toggleDefault = styles.getPropertyValue("--color--toggle").trim();

  groups.forEach((group) => {
    const toggle = group.querySelector("[data-pricing-option-toggle]");
    if (!toggle) return;

    const toggleInner = toggle.querySelector(".toggle_inner");
    const options = group.querySelectorAll("[data-pricing-option]");

    function update(option, animate = true) {
      const active = group.querySelector(
        `[data-pricing-option="${option}"]`
      );

      if (!active) return;

      const inactive = [...options].filter(
        (el) => el.dataset.pricingOption !== option
      );

      toggle.dataset.pricingOptionToggle = option;

      if (animate) {
        const tl = gsap.timeline();

        if (inactive.length) {
          tl.to(inactive, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.out",
            stagger: 0,
            onComplete: () => {
              inactive.forEach((el) => (el.style.display = "none"));
            },
          });
        }

        tl.call(() => {
          active.style.display = "";
        });

        tl.fromTo(
          active,
          {opacity: 0},
          {
            opacity: 1,
            duration: 0.25,
            ease: "power2.out",
          }
        );
      } else {
        options.forEach((el) => {
          if (el === active) {
            el.style.display = "";
            gsap.set(el, {opacity: 1});
          } else {
            el.style.display = "none";
            gsap.set(el, {opacity: 0});
          }
        });
      }

      gsap.to(toggleInner, {
        marginLeft: option === "2" ? option2Offset : 0,
        duration: 0.35,
        ease: "power2.out",
      });

      gsap.to(toggle, {
        backgroundColor: option === "2" ? toggleGreen : toggleDefault,
        duration: 0.35,
        ease: "power2.out",
      });
    }

    update(toggle.dataset.pricingOptionToggle || "1", false);

    toggle.addEventListener("click", () => {
      update(toggle.dataset.pricingOptionToggle === "1" ? "2" : "1");
    });
  });
}

// nav
function handleMobileNavLinkClicks(page) {
  page = page || document;

  const menuOpenIcon = page.querySelector('[data-menu-open-icon]');
  const menuCloseIcon = page.querySelector('[data-menu-close-icon]');
  const mobileNavMenu = page.querySelector('[data-mobile-nav-menu]');
  let MobileNavMenuLinks = mobileNavMenu.querySelectorAll('a');
  let brandLink = page.querySelector('[data-nav-brand-link]');

  const allMobileNavMenuLinks = [...MobileNavMenuLinks, brandLink];

  allMobileNavMenuLinks.forEach((link) => {

    link.addEventListener('click', () => {
      menuCloseIcon.style.display = "none";
      menuOpenIcon.style.display = "flex";
    })

  });

}

// function initNavigationMenuExpandAnimation(page) {
//   page = page || document;

//   const nav = page.querySelector('[data-navigation]');
//   const dropdownList = page.querySelector('[data-dropdown-list]');
//   const background = page.querySelector('[data-nav-background]');
//   const dropLink = page.querySelector('[data-dropdown-link]');
//   const dropHelper = page.querySelector('[data-animate-drop]');

//   if (!nav || !dropdownList || !background || !dropLink || !dropHelper) return;

//   const navExapandTimeline = gsap.timeline();

//   navExapandTimeline
//     .fromTo(nav, {
//       width: "58rem"
//     }, {
//       width: "112.5rem",
//       duration: 0.6,
//       ease: "power1.inOut"
//     }, 0)
//     .fromTo(nav, {
//       height: "2.8125rem",
//     }, {
//       height: "27.1875rem",
//       duration: 0.6,
//       ease: "power1.inOut"
//     }, 0)
//     .fromTo(background, {
//       opacity: 0
//     }, {
//       opacity: 1,
//       duration: 0.5,
//       ease: "power1.out"
//     }, 0)
//     .fromTo(dropdownList, {
//       opacity: 0
//     }, {
//       opacity: 1,
//       duration: 0.45,
//       ease: "power1.inOut"
//     }, 0.4);

//   navExapandTimeline.pause();

//   dropLink.addEventListener("mouseenter", () => {
//     navExapandTimeline.play();
//   });

//   dropHelper.addEventListener("mouseleave", () => {
//     navExapandTimeline.reverse();
//   });

// }

// function initNavTooltips() {
//   const nav = document.querySelector('[data-navigation]');
//   if (!nav) return;

//   const tooltipElements = nav.querySelectorAll('[data-css-tooltip-hover]');
//   let timeoutId = null;

//   window.addEventListener('resize', () => {
//     if (isMobileOrTablet()) {
//       nav.style.overflow = 'visible';
//     } else {
//       nav.style.overflow = 'clip';
//     }
//   });

//   tooltipElements.forEach((element) => {
//     element.addEventListener('mouseenter', () => {
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//         timeoutId = null;
//       }
//       nav.style.overflow = 'visible';
//     });

//     element.addEventListener('mouseleave', () => {
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//       }

//       timeoutId = setTimeout(() => {
//         nav.style.overflow = 'clip';
//         timeoutId = null;
//       }, 400);
//     });
//   });
// }


function formatDates(page) {
  page = page || document;
  let dateElements = page.querySelectorAll('[data-format-date]');
  if (dateElements.length === 0) return;

  dateElements.forEach(dateElement => {
    let date = new Date(dateElement.getAttribute('data-format-date'));
    let monthText = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
    dateElement.textContent = date.getDate() + ". " + monthText[date.getMonth()] + " " + date.getFullYear();
  });

  // if (DEBUG) console.log("Blog post dates initialized");
}
function formatNumbers(page) {
  page = page || document;
  const formats = new Map([
    [
      "usd",
      {
        locale: "en-US",
        style: "currency",
        currency: "USD",
      },
    ],
    [
      "gbp",
      {
        locale: "en-US",
        style: "currency",
        currency: "GBP",
      },
    ],
    [
      "eur",
      {
        locale: "en-US",
        style: "currency",
        currency: "EUR",
      },
    ],
    [
      "jpy",
      {
        locale: "ja-JP",
        style: "currency",
        currency: "JPY",
      },
    ],
    [
      "%",
      {
        locale: "en-US",
        style: "percent",
      },
    ],
  ]);

  const numberElementAttributeText = "data-format-number";

  page.querySelectorAll(`[${numberElementAttributeText}]`).forEach((item) => {
    const text = item.textContent.trim();
    const value = Number(text);

    if (Number.isNaN(value)) return;

    const formatKey = item.getAttribute(numberElementAttributeText)?.toLowerCase();
    const format = formats.get(formatKey);

    if (!format) return;

    // Determine number of decimal places from the original text
    const decimals = text.includes(".")
      ? text.split(".")[1].length
      : 0;

    const settings = {
      style: format.style,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    };

    if (format.currency) {
      settings.currency = format.currency;
    }

    const formatter = new Intl.NumberFormat(format.locale, settings);

    item.textContent = formatter.format(value);
  });
}

function updateCreatorAge(page) {
  page = page || document;
  const ageElement = page.querySelector("[data-creator-age]");
  if (!ageElement) return;

  const birthDateString = ageElement.dataset.creatorAge;
  if (!birthDateString) return;

  const [month, day, year] = birthDateString.split(".").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  const getYearLabel = (age) => {
    const lastDigit = age % 10;
    if (lastDigit >= 2 && lastDigit <= 4) return "godine";
    return "godina";
  };

  ageElement.textContent = `(${age} ${getYearLabel(age)})`;

  const isBirthday =
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate();

  page.querySelectorAll("[data-birthday-indicator]").forEach((el) => {
    el.style.display = isBirthday ? "" : "none";
  });
}


async function measureFrameRate(duration = 1500) {
  return new Promise(resolve => {
    let frames = 0;
    const start = performance.now();

    function tick(now) {
      frames++;
      if (now - start >= duration) {
        resolve((frames * 1000) / (now - start));
      } else {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  });
}

measureFrameRate().then(fps => {
  if (fps < 31) {
    // document.documentElement.classList.remove("heavy-effects");
    let pageBlurElements = document.querySelectorAll('.progressive-blur_wrap');
    pageBlurElements.forEach(el => {
      el.remove();
    });
  }
});


function setCopyrightYear(page) {
  page = page || document;
  const yearElement = page.querySelector("[data-copyright-year]");
  if (!yearElement) return;
  const currentYear = new Date().getFullYear();
  yearElement.textContent = currentYear;
  // if (DEBUG) console.log("Copyright year set to", currentYear);
}

function initNewsletterFormSubmitButton(page) {
  page = page || document;
  const trigger = page.querySelector("[data-newsletter-button]");
  const submit = page.querySelector("[data-newsletter-submit]");

  if (!trigger || !submit) return;

  const activate = (e) => {
    e.preventDefault();
    submit.click();
  };

  trigger.addEventListener("click", activate);

  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      activate(e);
    }
  });
}

function initScrollIntoViewFirst(page) {
  page = page || document;
  gsap.matchMedia().add("(min-width: 992px)", () => {
    const targets = page.querySelectorAll("[data-scroll-into-view-first]");
    if (targets.length === 0) return;

    targets.forEach(target => {
      gsap.fromTo(target, {
        y: "1.5rem",
        opacity: 0
      }, {
        y: "0rem",
        opacity: 1,
        delay: 0.2,
        duration: 0.7,
        ease: "outQuart",
        scrollTrigger: {
          trigger: target,
          start: "top bottom",
          markers: DEBUG,
        }
      });
    });
  });
}

function initFadeInOnScroll(page) {
  page = page || document;
  const targets = page.querySelectorAll('[data-fade-in-on-scroll]');
  if (targets.length === 0) return;

  targets.forEach(target => {
    gsap.fromTo(target, {
      opacity: 0,
    }, {
      opacity: 1,
      delay: .5,
      duration: 1,
      ease: "outQuart",
      scrollTrigger: {
        trigger: target,
        start: "top bottom",
        // markers: DEBUG,
      }
    });
  });
}

function initLogoScroller(page) {
  page = page || document;
  const scrollers = page.querySelectorAll("[data-marquee-scroller]");

  scrollers.forEach(scroller => {
    const items = scroller.querySelectorAll("[data-marquee-group]");
    if (!items.length) return;

    gsap.timeline({
      repeat: -1
    })
      .to(items, {
        xPercent: 100,
        duration: 25,
        ease: "none"
      });
  });
}

function initYTScroller(page) {
  page = page || document;
  const scrollers = page.querySelectorAll("[data-animate-scroller]");

  scrollers.forEach(scroller => {
    const items = scroller.querySelectorAll("[data-animate-scroller-item]");
    if (!items.length) return;

    gsap.timeline({
      repeat: -1
    })
      .to(items, {
        xPercent: 100,
        duration: 60,
        ease: "none"
      });
  });
}

function initTestimonialScrollers(page) {
  page = page || document;
  const scrollers = page.querySelectorAll("[data-testimonial-scroller]");

  scrollers.forEach(scroller => {
    const items = scroller.querySelectorAll("[data-testimonial-group]");
    if (!items.length) return;

    const direction = scroller.getAttribute('data-testimonial-scroller') || "right";

    gsap.timeline({
      repeat: -1
    })
      .to(items, {
        xPercent: direction === "left" ? -100 : 100,
        duration: 25,
        ease: "none"
      });
  });
}

function initServiceIconBoxHoverAnimation(page) {
  page = page || document;

  gsap.matchMedia().add("(min-width: 992px)", () => {

    const allBoxes = page.querySelectorAll('[data-service-icon-box]');
    if (allBoxes.length === 0) return;

    const colorDark = getComputedStyle(document.body).getPropertyValue('--colors-interface--dark-2');
    const colorBrand = getComputedStyle(document.body).getPropertyValue('--colors-brand--brand-1');

    allBoxes.forEach(box => {
      const blob1 = box.querySelector('[data-service-blob-1]');
      const blob2 = box.querySelector('[data-service-blob-2]');
      const gridBG = box.querySelector('[data-service-grid-bg]');


      gsap.set(blob1, {opacity: 0, scale: 0.7, });
      gsap.set(blob2, {opacity: 0, scale: 0.7, });
      gsap.set(box, {backgroundColor: colorDark, });
      gsap.set(gridBG, {opacity: .2, });

      const hoverTimeline = gsap.timeline({
        paused: true,
        defaults: {
          duration: 0.2,
          ease: "linear"
        }
      });

      hoverTimeline
        .to(blob2, {opacity: 1, scale: 1}, 0)
        .to(blob1, {opacity: 1, scale: 1}, 0.2)
        .to(box, {backgroundColor: colorBrand}, 0)
        .to(gridBG, {opacity: 0.6}, 0);

      box.addEventListener("pointerenter", () => {
        hoverTimeline.play();
      });

      box.addEventListener("pointerleave", () => {
        hoverTimeline.reverse();
      });
    });
  });
}

function initCreatorCardHoverAnimation(page) {
  page = page || document;
  if (!isDesktopLikeDevice) return;

  const allCards = page.querySelectorAll('[data-creator-card]');
  if (allCards.length === 0) return;

  allCards.forEach(card => {
    const image = card.querySelector('[data-creator-card-image]');
    const arrow = card.querySelector('[data-creator-card-arrow]');

    card.addEventListener("pointerenter", () => {
      gsap.to(image, {opacity: .66, ease: "outQuad", duration: 0.3});
      gsap.to(arrow, {opacity: 1, ease: "outQuad", duration: 0.3});
    });
    card.addEventListener("pointerleave", () => {
      gsap.to(image, {opacity: 1, ease: "outQuad", duration: 0.3});
      gsap.to(arrow, {opacity: .5, ease: "outQuad", duration: 0.3});
    });
  });
}

function initBlogCardHoverAnimation(page) {
  page = page || document;
  if (!isDesktopLikeDevice) return;

  const allCards = page.querySelectorAll('[data-blog-card]');
  if (allCards.length === 0) return;

  const colorGlassBgWhite = getComputedStyle(document.body).getPropertyValue('--colors-interface--glass-bg-white');
  const colorTransparent = "#ffffff00";

  allCards.forEach(card => {
    const arrow = card.querySelector('[data-blog-card-arrow]');
    const image = card.querySelector('[data-blog-card-image]');

    card.addEventListener("pointerenter", () => {
      gsap.to(arrow, {opacity: 1, ease: "outQuad", duration: 0.3});
      gsap.to(card, {borderColor: colorGlassBgWhite, ease: "outQuad", duration: 0.3});
      gsap.to(image, {opacity: .66, ease: "outQuad", duration: 0.3});
    });
    card.addEventListener("pointerleave", () => {
      gsap.to(arrow, {opacity: .5, ease: "outQuad", duration: 0.3});
      gsap.to(card, {borderColor: colorTransparent, ease: "outQuad", duration: 0.3});
      gsap.to(image, {opacity: 1, ease: "outQuad", duration: 0.3});
    });
  });
}

function initEventCardHoverAnimation(page) {
  page = page || document;
  if (!isDesktopLikeDevice) return;

  const allCards = page.querySelectorAll('[data-event-card]');
  if (allCards.length === 0) return;

  const colorGlassBgWhite = getComputedStyle(document.body).getPropertyValue('--colors-interface--glass-bg-white');
  const colorTransparent = "#ffffff00";

  allCards.forEach(card => {
    const arrow = card.querySelector('[data-event-card-arrow]');
    const images = card.querySelectorAll('[data-event-card-image]');

    card.addEventListener("pointerenter", () => {
      gsap.to(arrow, {opacity: 1, ease: "outQuad", duration: 0.3});
      gsap.to(card, {borderColor: colorGlassBgWhite, ease: "outQuad", duration: 0.3});
      gsap.to(images, {opacity: .66, ease: "outQuad", duration: 0.3});
    });
    card.addEventListener("pointerleave", () => {
      gsap.to(arrow, {opacity: .5, ease: "outQuad", duration: 0.3});
      gsap.to(card, {borderColor: colorTransparent, ease: "outQuad", duration: 0.3});
      gsap.to(images, {opacity: 1, ease: "outQuad", duration: 0.3});
    });
  });
}

function initEducationCardHoverAnimation(page) {
  page = page || document;
  if (!isDesktopLikeDevice) return;

  const allCards = page.querySelectorAll('[data-edu-card]');
  if (allCards.length === 0) return;

  const colorGlassBgWhite = getComputedStyle(document.body).getPropertyValue('--colors-interface--glass-bg-white');
  const colorTransparent = "#ffffff00";

  allCards.forEach(card => {
    const arrow = card.querySelector('[data-edu-card-arrow]');
    const blob = card.querySelector('[data-edu-card-blob]');
    // const content = card.querySelector('[data-edu-card-content]');

    card.addEventListener("pointerenter", () => {
      gsap.to(arrow, {opacity: 1, ease: "outQuad", duration: 0.3});
      gsap.to(blob, {opacity: .3, ease: "outQuad", duration: 0.3});
      gsap.to(card, {borderColor: colorGlassBgWhite, ease: "outQuad", duration: 0.3});
    });
    card.addEventListener("pointerleave", () => {
      gsap.to(arrow, {opacity: .5, ease: "outQuad", duration: 0.3});
      gsap.to(blob, {opacity: 0, ease: "outQuad", duration: 0.3});
      gsap.to(card, {borderColor: colorTransparent, ease: "outQuad", duration: 0.3});
    });
  });
}

function initGlowingLightsHeroSmall(page) {
  page = page || document;
  const section = page.querySelector("[data-animate-hero-lights]");
  if (!section || section.__glowingLightsHeroSmallInit) return;

  const blobA = section.querySelector('[data-hero-blob="a"]');
  const blobB = section.querySelector('[data-hero-blob="b"]');
  const blobC = section.querySelector('[data-hero-blob="c"]');

  if (!blobA || !blobB || !blobC || typeof gsap === "undefined") return;

  section.__glowingLightsHeroSmallInit = true;

  const mm = gsap.matchMedia();

  const createTimeline = () =>
    gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: {
        overwrite: "auto",
      },
    });

  mm.add("(min-width: 768px)", () => {
    gsap.set([blobA, blobB, blobC], {
      opacity: 1,
      transformOrigin: "50% 50%",
      willChange: "transform, opacity",
    });

    gsap.set(blobA, {
      x: "500px",
      y: "500px",
      scale: 1.2,
    });

    gsap.set(blobB, {
      x: "202px",
      y: "-271px",
      scale: 1,
      rotationX: 0,
    });

    gsap.set(blobC, {
      x: "-39vw",
      y: "-22vh",
      scale: 0.7,
      rotationZ: 15,
      skewX: 7,
    });

    const tl = createTimeline();

    tl.to(blobA, {x: "500px", y: "271px", duration: 8, ease: "ease"}, 0);
    tl.to(blobB, {x: "202px", y: "279px", duration: 8, ease: "linear"}, 0);
    tl.to(blobC, {x: "-30vw", y: "-13vh", duration: 5, ease: "linear"}, 0);

    tl.to(blobB, {opacity: 1, duration: 2, ease: "easeOut"}, 0);
    tl.to(blobA, {opacity: 1, duration: 3, ease: "easeOut"}, 0);
    tl.to(blobC, {scale: 1, duration: 8, ease: "easeInOut"}, 0);
    tl.to(blobC, {skewX: 0, rotationZ: 0, duration: 2, ease: "easeOut"}, 0);
    tl.to(blobC, {opacity: 1, duration: 2.5, ease: "easeInOut"}, .2);
    tl.to(blobA, {scale: 1, duration: 8, ease: "easeInOut"}, .2);
    tl.to(blobB, {scale: 1, duration: 8, ease: "easeInOut"}, .2);

    tl.to(blobA, {x: "-271px", y: "256px", duration: 12, ease: "easeInOut"}, 8.2);
    tl.to(blobB, {x: "-340px", y: "424px", duration: 12, ease: "linear"}, 8.2);
    tl.to(blobC, {x: "16vw", duration: 12, ease: "easeInOut"}, 8.2);

    tl.to(blobA, {opacity: .93, duration: 8, ease: "bounce"}, 8.2);
    tl.to(blobB, {opacity: .91, duration: 9, ease: "linear"}, 8.2);
    tl.to(blobC, {opacity: .81, duration: 10, ease: "easeInOut"}, 8.2);
    tl.to(blobB, {rotationX: 15, duration: 12, ease: "bounce"}, 8.2);
    tl.to(blobC, {scale: .9, duration: 8, ease: "easeInOut"}, 8.2);

    return () => tl.kill();
  });

  mm.add("(max-width: 767px)", () => {
    gsap.set([blobA, blobB, blobC], {
      opacity: 1,
      transformOrigin: "50% 50%",
      willChange: "transform, opacity",
    });

    gsap.set(blobA, {
      x: "-126px",
      y: "202px",
      scale: 1,
    });

    gsap.set(blobB, {
      x: "-347px",
      y: "34px",
      scale: 1.6,
      rotationX: 0,
    });

    gsap.set(blobC, {
      x: "202px",
      y: "218px",
      scale: 0.8,
      rotationZ: 89,
      skewX: -40,
    });

    const tl = createTimeline();

    tl.to(blobA, {x: "-50px", y: "-4px", duration: 8, ease: "ease"}, 0);
    tl.to(blobB, {x: "172px", y: "50px", duration: 8, ease: "linear"}, 0);
    tl.to(blobC, {x: "57px", y: "27px", duration: 8, ease: "linear"}, 0);

    tl.to(blobB, {opacity: 1, duration: 2, ease: "easeOut"}, 0);
    tl.to(blobA, {opacity: 1, duration: 8, ease: "easeOut"}, 0);
    tl.to(blobC, {scale: 1.6, duration: 8, ease: "easeInOut"}, 0);
    tl.to(blobC, {skewX: 0, duration: 2, ease: "easeOut"}, 0);
    tl.to(blobC, {rotationZ: 0, duration: 8, ease: "easeOut"}, 0);
    tl.to(blobC, {opacity: 1, duration: 2.5, ease: "easeOut"}, .2);
    tl.to(blobA, {scale: 1, duration: 8, ease: "easeInOut"}, .2);
    tl.to(blobB, {scale: 1.1, duration: 8, ease: "easeInOut"}, .2);

    tl.to(blobA, {x: "-309px", y: "57px", duration: 7, ease: "easeInOut"}, 8.2);
    tl.to(blobB, {x: "-65px", y: "-294px", duration: 7, ease: "linear"}, 8.2);
    tl.to(blobC, {scale: 1.4, x: "323px", y: "225px", duration: 7, ease: "easeInOut"}, 8.2);

    tl.to(blobA, {opacity: .93, duration: 7, ease: "bounce"}, 8.2);
    tl.to(blobC, {opacity: .81, duration: 7, ease: "easeInOut"}, 8.2);
    tl.to(blobB, {rotationX: 15, duration: 7, ease: "bounce"}, 8.2);
    tl.to(blobB, {opacity: .91, duration: 7, ease: "linear"}, 8.2);

    return () => tl.kill();
  });

  return () => {
    mm.revert();
    delete section.__glowingLightsHeroSmallInit;
  };
}

// sales page animations
function initPricingGlowAnimation(page) {
  page = page || document;
  if (window.innerWidth >= 992) {
    const sections = page.querySelectorAll('[data-pricing-with-glow]');
    if (sections.length === 0) return;

    sections.forEach(section => {
      const glow = section.querySelector('[data-pricing-glow]');
      if (!glow) return;

      gsap.fromTo(glow, {
        opacity: .4,
        scale: .66,
      }, {
        opacity: .55,
        scale: 1,
        duration: .75,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "top center"
        }
      })
    });
  }
}
function initBottomBarAnimation(page) {
  page = page || document;
  const bar = page.querySelector('[data-bottom-bar]');
  if (!bar) return;
  gsap.set(bar, { y: "6.25rem", opacity: 0 });
  gsap.to(bar, { y: "0rem", opacity: 1, delay: .75, duration: .3, ease: "outQuad" });
}

function initFavicons(page) {
  page = page || document;
  const regularIcon =
    'https://cdn.prod.website-files.com/6a2bd64ef620571116d167ab/6a2fefbcc5b19a5e2d0bd9f4_AI%20Univerzitet%20Favicon.png';

  const notificationIcon =
    'https://cdn.prod.website-files.com/6a2bd64ef620571116d167ab/6a2ff040d468e66a00257604_AI%20Univerzitet%20Favicon%20Notification.png';

  const faviconSelectors = [
    'link[rel="icon"][media="(prefers-color-scheme: light)"]',
    'link[rel="icon"][media="(prefers-color-scheme: dark)"]',
  ];

  const hasFaviconLinks = faviconSelectors.some(function (selector) {
    return page.querySelector(selector);
  });

  const isDesktopLikeDevice = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  ).matches;

  const isStandaloneApp =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone;

  if (!hasFaviconLinks || !isDesktopLikeDevice || isStandaloneApp) {
    return;
  }

  let inactivityTimer;

  function setFavicons(href) {
    faviconSelectors.forEach(function (selector) {
      const icon = page.querySelector(selector);

      if (icon) {
        icon.href = href;
      }
    });
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    setFavicons(regularIcon);

    inactivityTimer = setTimeout(function () {
      setFavicons(notificationIcon);
    }, 10000);
  }

  page.addEventListener('mousemove', resetInactivityTimer);
  page.addEventListener('keypress', resetInactivityTimer);

  resetInactivityTimer();
}

document.addEventListener("DOMContentLoaded", () => {
  initLenis();

  handleMobileNavLinkClicks();
  // initNavTooltips();
  // initNavigationMenuExpandAnimation();


  if (has('[data-format-date]')) formatDates();
  if (has('[data-format-number]')) formatNumbers();
  if (has('[data-creator-age]')) updateCreatorAge();

  if (has('[data-highlight-text]')) initHighlightText();

  if (has('[data-faq-item]')) initFAQ();
  if (has('[data-faq-tabs]')) initFAQWraps();
  if (has('[data-tabs-wrap]')) initHelpCenter();

  if (has('[data-counter]')) initCounters();

  if (has('[data-newsletter-form]')) initNewsletterFormSubmitButton();

  if (has('[data-popup-1]')) initPopup(1);
  if (has('[data-popup-2]')) initPopup(2);
  if (has('[data-popup-3]')) initPopup(3);

  if (has('[data-pricing-toggle-group]')) initPricingToggle();

  if (has('[data-marquee-scroller]')) initLogoScroller();
  if (has('[data-animate-scroller]')) initYTScroller();
  if (has('[data-testimonial-scroller]')) initTestimonialScrollers();

  if (has('[data-scroll-into-view-first]')) initScrollIntoViewFirst();
  if (has('[data-fade-in-on-scroll]')) initFadeInOnScroll();

  if (has('[data-creator-card]')) initCreatorCardHoverAnimation();
  if (has('[data-edu-card]')) initEducationCardHoverAnimation();
  if (has('[data-blog-card]')) initBlogCardHoverAnimation();
  if (has('[data-event-card]')) initEventCardHoverAnimation();

  if (has('[data-service-icon-box]')) initServiceIconBoxHoverAnimation();
  if (has('[data-pricing-with-glow]')) initPricingGlowAnimation();
  if (has('[data-bottom-bar]')) initBottomBarAnimation();

  if (has('[data-copyright-year]')) setCopyrightYear();

  if (has('[data-animate-hero-lights]')) initGlowingLightsHeroSmall();

  if (main && loaderContainer) {
    if (has('[data-animate-section-after-load]')) afterLoadHeroIntro();
    if (has('[data-animate-after-hero]')) afterHeroIntro();
    loadPage();
  }

  initPageBlurAnimation();
  initFavicons();

  if (DEBUG) console.log("Version: " + version);
});

Webflow.push(function () {$('#filter').submit(function () {return false;});});