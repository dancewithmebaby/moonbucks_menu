//-[X] 서버 생성

//todo - 요청
//-[] 서버에 새로운 메뉴가 추가될 수 있도록 요청
//- [] 서버에 카테고리별 메뉴 리스트 불러온다.
//-[] 서버에 메뉴가 수정할 수 있도록 요청
//-[] 메뉴가 삭제될 수 있도록 요청
//-[] 서버의 메뉴의 품절상태를 토글할 수 있도록 요청

//리팩토링
//- [ ] localStorage에 저장하는 로직은 지운다.
//- [ ] fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현한다.

//사용자 경험
//- [ ] API 통신이 실패하는 경우에 대해 사용자가 알 수 있게 [alert](https://developer.mozilla.org/ko/docs/Web/API/Window/alert)으로 예외처리를 진행한다.
//- [ ] 중복되는 메뉴는 추가할 수 없다.

import { $ } from "./utils/dom.js";
import MenuApi from "./api/index.js";

function App() {
  // (객체의) 상태(변하는 데이터) - 메뉴명(개수는 굳이 관리할 필요 x > 로컬저장소에 저장 x)
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };

  this.currentCategory = "espresso";

  //초기화 역할하는 method
  this.init = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(this.currentCategory);
    render();
    initEventListner();
  };

  const initEventListner = () => {
    // form태그가 웹서버에 자동으로 전송하는것을 막아줌
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });

    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-edit-button")) {
        updatedMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
        return;
      }
    });

    $("#menu-submit-button").addEventListener("click", addMenuName);

    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      addMenuName();
    });

    $("nav").addEventListener("click", changeCategory);
  };

  const changeCategory = (e) => {
    const isCategoryBtn = e.target.classList.contains("cafe-category-name");
    if (isCategoryBtn) {
      const categoryName = e.target.dataset.categoryName;
      this.currentCategory = categoryName;
      $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
      render();
    }
  };

  const render = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(this.currentCategory);
    const template = this.menu[this.currentCategory]
      .map((menuItem) => {
        return `
         <li data-menu-id="${menuItem.id}" class="menu-list-item d-flex items-center py-2">
         <span class="w-100 pl-2 menu-name ${menuItem.isSoldOut ? "sold-out" : ""}">${menuItem.name}</span>
         <button
           type="button"
           class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
         >
           품절
         </button>
         <button
           type="button"
           class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
         >
           수정
         </button>
         <button
           type="button"
           class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
         >
           삭제
         </button>
        </li>`;
      })
      .join("");

    $("#menu-list").innerHTML = template;
    updateMenuCount();
  };

  const updateMenuCount = () => {
    const menuCount = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCount}개`;
  };

  const addMenuName = async () => {
    if ($("#menu-name").value === "") {
      alert("값을 입력하시오");
      return;
    }

    const duplicatedItem = this.menu[this.currentCategory].find((menuItem) => menuItem.name === $("#menu-name").value);

    if (duplicatedItem) {
      alert("중복된 메뉴입니다. 다시 입력해주세요");
      $("#menu-name").value = "";
      return;
    }

    const menuName = $("#menu-name").value;
    //this.menu[this.currentCategory].push({ name: MenuName });

    await MenuApi.createMenu(this.currentCategory, menuName);
    render();
    $("#menu-name").value = "";

    //store.setLocalStorage(this.menu);
    //render();
    //$("#menu-name").value = "";
  };

  const updatedMenuName = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const menuName = $menuName.innerText;
    const updatedMenuName = prompt("수정할 메뉴명을 입력하시오", menuName);
    await MenuApi.updateMenu(this.currentCategory, updatedMenuName, menuId);
    render();
  };

  const removeMenuName = async (e) => {
    if (confirm("삭제하시겠습니까?")) {
      const menuId = e.target.closest("li").dataset.menuId;
      await MenuApi.deleteMenu(this.currentCategory, menuId);
      render();
    }
  };

  const soldOutMenu = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);
    render();
  };
}

const app = new App();
app.init();
