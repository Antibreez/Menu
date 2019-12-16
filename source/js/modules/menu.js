(function () {
  let hided = 0;

  let nav = priorityNav.init({
    navDropdownLabel: ``,
    mainNavWrapper: `.main-nav`,
    breakPoint: 300,
  });


  let body = document.querySelector(`body`);
  let mainNav = document.querySelector(`.main-nav`);
  let mainNavList = document.querySelector(`.main-nav__list`);
  let secondaryNavs = document.querySelectorAll(`.secondary-nav__list`);
  let secondaryNavBox = document.querySelector(`.secondary-nav__container`);
  let mainNavItems = document.querySelectorAll(`.main-nav__item`);
  let menuButton = document.querySelector(`.nav__dropdown-toggle`);
  let dropdownNav = document.querySelector(`.nav__dropdown`);
  let thirdNavContainer = document.querySelector(`.third-nav-container`);

  let currentSecondaryNav = secondaryNavs[2];

  function clearActive(items, name) {
    items.forEach(function (item) {
      if (item.classList.contains(name)) {
        item.classList.remove(name);
      }
    })
  }

  function clearShown(items) {
    items.forEach(function (item) {
      if (!item.classList.contains(`hidden`)) {
        item.classList.add(`hidden`);
      }
    });
  }

  function showItem(item) {
    item.classList.remove(`hidden`);
  }

  function onMainNavClick(evt) {
    let target = evt.target;
    let item = target.classList.contains(`main-nav__item`) ? target
      : target.parentNode.classList.contains(`main-nav__item`) ? target.parentNode
      : target.parentNode.parentNode.classList.contains(`main-nav__item`) ? target.parentNode.parentNode
      : null;

    if (item === null) {
      return;
    }

    if (item.parentNode === dropdownNav) {
      menuButton.classList.remove(`is-open`);
      mainNav.classList.remove(`is-open`);
      dropdownNav.classList.remove(`show`);
      dropdownNav.setAttribute(`aria-hidden`, true);
    }

    if (!item.classList.contains(`main-nav__item--active`)) {
      let idx = +item.getAttribute(`index`);
      let secondaryNav = secondaryNavs[idx];

      clearActive(mainNavItems, `main-nav__item--active`);
      clearActive(currentSecondaryNav.querySelectorAll(`li`), `active`);
      item.classList.add(`main-nav__item--active`);

      clearShown(secondaryNavs);
      if (secondaryNav) {
        currentSecondaryNav = secondaryNav;
        showItem(secondaryNav);
      }
    }
  }

  function scrollHorizontally(e) {
    clearActive(currentSecondaryNav.querySelectorAll(`li`), `active`);
    thirdNavContainer.innerHTML = ``;

    let scrollPos = this.scrollLeft;

    e = window.event || e;
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    this.scrollLeft -= (delta*20);

    let widthElem = this.scrollWidth;
    let widthBrowser = document.documentElement.clientWidth;

    if ((delta == 1 ) && (this.scrollLeft == 0)) return;
    if ((widthBrowser >= widthElem) || (scrollPos == this.scrollLeft)) return;

    e.preventDefault();
  }

  function onTouchStart(e) {
    let x = 0;

    function onTouchMove(e) {
      clearActive(currentSecondaryNav.querySelectorAll(`li`), `active`);
      thirdNavContainer.innerHTML = ``;

      let touchobj = e.changedTouches[0];

      if (x !== 0) {
        secondaryNavBox.scrollLeft += x - touchobj.clientX;
      }

      x = touchobj.clientX;
    }

    function onTouchEnd(e) {
      document.removeEventListener(`touchmove`, onTouchMove);
      document.removeEventListener(`touchend`, onTouchEnd)
    }

    document.addEventListener(`touchmove`, onTouchMove);
    document.addEventListener(`touchend`, onTouchEnd);
  }

  function onMouseDown(e) {
    let x = 0;
    let moved = false;

    function onMouseMove(e) {
      clearActive(currentSecondaryNav.querySelectorAll(`li`), `active`);
      thirdNavContainer.innerHTML = ``;

      e.preventDefault();
      moved = true;

      if (x !== 0) {
        secondaryNavBox.scrollLeft += x - e.clientX;
      }

      x = e.clientX;
    }

    function onMouseUp(e) {
      let item;
      let isActive = false;

      if (!moved) {
        let target = e.target;
        item = target.tagName.toLowerCase() === `li` ? target
          : target.parentNode.tagName.toLowerCase() === `li` ? target.parentNode
          : target.parentNode.parentNode.tagName.toLowerCase() === `li` ? target.parentNode.parentNode
          : null;
      }

      if (item && item.classList.contains(`active`)) {
        item.classList.remove(`active`);
        thirdNavContainer.innerHTML = ``;
        isActive = true;
      }

      if (item && !item.classList.contains(`active`) && !isActive) {
        clearActive(currentSecondaryNav.querySelectorAll(`li`), `active`);
        item.classList.add(`active`);

        let thirdNav = item.querySelector(`.third-nav`);
        let thirdNavDeep = item.querySelector(`.third-nav__inner-list-wrap`);

        let node = !!thirdNav && thirdNav.cloneNode(true);
        let nodeDeep = !!thirdNavDeep && thirdNavDeep.cloneNode(true);

        let itemRect = item.getBoundingClientRect();
        let boxRect = secondaryNavBox.getBoundingClientRect();
        let wrapRect = secondaryNavBox.parentNode.getBoundingClientRect();

        if (itemRect.right > boxRect.right) {
          secondaryNavBox.scrollLeft += itemRect.right - boxRect.right;
          itemRect = item.getBoundingClientRect();
        }

        if (itemRect.left < boxRect.left) {
          secondaryNavBox.scrollLeft += itemRect.left - boxRect.left;
          itemRect = item.getBoundingClientRect();
        }

        if (node) {
          node.querySelectorAll(`li`).forEach(function (item, idx) {
            item.setAttribute(`index`, idx);
          });

          thirdNavContainer.appendChild(node);
          if (nodeDeep) {
            thirdNavContainer.appendChild(nodeDeep);
          }
          thirdNavContainer.style.right = `auto`;
          thirdNavContainer.style.top = itemRect.height + `px`;
          thirdNavContainer.style.left = (itemRect.left - wrapRect.left) === 0
            ? 0
            : (itemRect.left - wrapRect.left) + `px`;

          if (thirdNavContainer.getBoundingClientRect().right > document.body.clientWidth) {

            thirdNavContainer.style.left = `auto`;
            thirdNavContainer.style.right = 0;
          }
        }
      }

      document.removeEventListener(`mousemove`, onMouseMove);
      document.removeEventListener(`mouseup`, onMouseUp);
    }

    document.addEventListener(`mousemove`, onMouseMove);
    document.addEventListener(`mouseup`, onMouseUp);
  }

  function onThirdNavClick(e) {
    let target = e.target;
    let innerLists = thirdNavContainer.querySelectorAll(`.third-nav__inner-list`);
    let thirdNavItems = thirdNavContainer.querySelectorAll(`.third-nav__level-1`);

    if (
      target.classList.contains(`third-nav__level-1`)
      && !target.classList.contains(`third-nav__level-1--active`)
    ) {
      if (innerLists[0]) {
        clearActive(thirdNavItems, `third-nav__level-1--active`);
        clearShown(innerLists);
        target.classList.add(`third-nav__level-1--active`);
        showItem(innerLists[+target.getAttribute(`index`)]);
      }

      if (thirdNavContainer.getBoundingClientRect().right > document.body.clientWidth) {
        thirdNavContainer.style.left = `auto`;
        thirdNavContainer.style.right = 0;
      }
    }
  }

  function onAnyClick(e) {
    let target = e.target;
    let item = target.classList.contains(`active`) ? target
      : target.parentNode.classList.contains(`active`) ? target.parentNode
      : target.parentNode.parentNode.classList.contains(`active`) ? target.parentNode.parentNode
      : null;

    if (!item
      && !target.classList.contains(`third-nav`)
      && !target.classList.contains(`third-nav__level-1`)
      && !target.classList.contains(`third-nav__level-2`)
      && !target.classList.contains(`third-nav__inner-list`)
      && !target.classList.contains(`third-nav__inner-link`)
    ) {
      clearActive(currentSecondaryNav.querySelectorAll(`li`), `active`);
      thirdNavContainer.innerHTML = ``;
    }
  }

  function onResize(e) {
    clearActive(currentSecondaryNav.querySelectorAll(`li`), `active`);
    thirdNavContainer.innerHTML = ``;
  }

  mainNavItems.forEach(function (item, idx) {
    item.setAttribute(`index`, idx);
  });

  body.addEventListener(`mousedown`, onAnyClick);
  window.addEventListener(`resize`, onResize);

  secondaryNavBox.addEventListener(`touchstart`, onTouchStart);
  secondaryNavBox.addEventListener(`mousedown`, onMouseDown);

  secondaryNavBox.addEventListener(`mousewheel`, scrollHorizontally);
  secondaryNavBox.addEventListener(`DOMMouseScroll`, scrollHorizontally);

  thirdNavContainer.addEventListener(`click`, onThirdNavClick);

  mainNav.addEventListener(`click`, onMainNavClick);
})();
