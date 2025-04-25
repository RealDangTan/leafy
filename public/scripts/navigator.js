import { server } from '../scripts/config.js';
import { still_tags_loader_with_link } from '../scripts/tags_loader.js';

var isLoggedIn = false;
var profile_picture_url = "../assets/images/imgDefaultProfilePicture.png";

await fetch(`${server}/user/get-user-info`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    credentials: "include",
}).then(response => response.json()).then(data => {
    if (data.success) {
        isLoggedIn = true;
        profile_picture_url = data.data.profile_picture_url;
    }
}).then(() => {

    document.querySelector("#profile-picture").src = profile_picture_url;

    const signedIn = document.querySelector(".signed-in");
    const signUp = document.querySelector(".sign-up");
    const show_on_login = document.querySelectorAll(".show-on-login");
    const change_on_login = document.getElementById("change-on-login");
    if (isLoggedIn) {
        signedIn.style.display = "flex";
        signUp.style.display = "none";
        show_on_login.forEach((element) => {
            element.style = "display: flex; align-items: center; justify-content: center;";
        });
        change_on_login.innerText = "Chỉnh sửa thông tin";
        change_on_login.href = "/profile";
    } else {
        signedIn.style.display = "none";
        signUp.style.display = "flex";
        show_on_login.forEach((element) => {
            element.style.display = "none";
        });
        change_on_login.href = "/login";
        change_on_login.innerText = "Đăng nhập";
    }

    document.querySelector(".menu-toggle").addEventListener("click", (e) => {
        e.stopPropagation();
        const profileMenuPopup = document.getElementById("profile-menu-popup");
        profileMenuPopup.classList.toggle("popup-show");
    });

    document.getElementById("profile-picture").addEventListener("click", (e) => {
        e.stopPropagation();
        const profileMenuPopup = document.getElementById("profile-menu-popup");
        profileMenuPopup.classList.toggle("popup-show");
    });

    if (window.innerWidth >= 1440) {
        const search_bar_width = window.getComputedStyle(document.querySelector(".nav-search-bar")).width;
        document.querySelector("#search-panel").style.width = parseFloat(search_bar_width) + 32 + "px";
    }

    document.addEventListener("click", (event) => {
        event.stopPropagation();
        const searchPanel = document.getElementById("search-panel");
        const profileMenuPopup = document.getElementById("profile-menu-popup");

        if (!searchPanel.contains(event.target) && !event.target.closest(".nav-search-bar")) {
            searchPanel.classList.remove("popup-show");
        }

        if (!profileMenuPopup.contains(event.target) && !event.target.closest(".menu-toggle")) {
            profileMenuPopup.classList.remove("popup-show");
        }
    });

    function updatePlaceholder() {
        const searchInput = document.querySelector(".search-input");
        document.querySelector("#profile-menu-popup").classList.remove("popup-show");
        if (window.innerWidth <= 1080) {
            searchInput.placeholder = "tìm kiếm...";
        } else {
            searchInput.placeholder = "tìm cảm hứng nghiên cứu...";
        }
        if (window.innerWidth >= 1440) {
            const search_bar_width = window.getComputedStyle(document.querySelector(".nav-search-bar")).width;
            document.querySelector("#search-panel").style.width = parseFloat(search_bar_width) + 32 + "px";
        }
    }

    function content_card_template(data) {
        const template = `<div class="title1">${data.title}</div>
            <div class="card-footer">
                <div class="author">
                    <img class="account-circle-icon" alt="" src="../assets/icons/icAccount.svg">                  
                    <div class="author-name">${data.author_name}</div>
                </div>
                <div class="date">
                    <img class="account-circle-icon" alt="" src="../assets/icons/icTime.svg">
                    <div class="author-name">${data.date_created}</div>
                </div>
                <div class="view">
                    <img class="account-circle-icon" alt="" src="../assets/icons/icEye.svg">
                    <div class="author-name">${data.view}</div>
                </div>
            </div>`;
        return template; 
    }

    function profile_card_template(data) {
        const template = `<div class="person-info">
                <img class="person-info-child" alt="" src="${data.profile_picture_url}">
                <div class="person-details">
                    <a class="person-name" style = "text-align: left;" href = '/profile?user_id=${data._id}'>${data.display_name}</a>
                    <div class="person-handle">@${data.username}</div>
                </div>
            </div>`;
        return template; 
    }

    document.getElementById("search-input").addEventListener("input", async () => {
        if (document.getElementById("search-input").value.length == 0) {
            document.getElementById("search-panel").classList.remove("popup-show");
            return;
        }
        const searchPanel = document.getElementById("search-panel");

        searchPanel.classList.add("popup-show");

        const searchPanelStillTagHeader = document.getElementById("search-panel-still-tag-header");
        const searchPanelStillTagContainer = document.getElementById("search-panel-still-tag-container");
        const searchPanelContentCardHeader = document.getElementById("search-panel-content-card-header");
        const searchPanelContentCardContainer = document.getElementById("search-panel-content-card-container");
        const searchPanelProfileCardHeader = document.getElementById("search-panel-profile-card-header");
        const searchPanelProfileCardContainer = document.getElementById("search-panel-profile-card-container");

        const url = `${server}/api/v1/get-search-value?value=${document.getElementById("search-input").value}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        let data = await response.json();
        if (!data.success) {
            searchPanelStillTagHeader.style.display = "none";
            searchPanelStillTagContainer.innerHTML = "<p>Hãy thêm tag '???' vào bài nghiên cứu của bạn<p>";
            searchPanelContentCardHeader.style.display = "none";
            searchPanelContentCardContainer.innerHTML = "";
            searchPanelProfileCardHeader.style.display = "none";
            searchPanelProfileCardContainer.innerHTML = "";
            return;
        }
        data = data.data;
        if (data.tags.length === 0 && data.posts.length === 0 && data.users.length === 0) {
            searchPanelStillTagHeader.style.display = "none";
            searchPanelStillTagContainer.innerHTML = "<p>Không tìm thấy kết quả nào...<p>";
            searchPanelContentCardHeader.style.display = "none";
            searchPanelContentCardContainer.innerHTML = "";
            searchPanelProfileCardHeader.style.display = "none";
            searchPanelProfileCardContainer.innerHTML = "";
            return;
        }
        if (data.tags.length == 0) {
            searchPanelStillTagHeader.style.display = "none";
            searchPanelStillTagContainer.innerHTML = "";
        } else {
            searchPanelStillTagHeader.style.display = "flex";
            searchPanelStillTagHeader.style.cursor = "pointer";
            searchPanelStillTagContainer.innerHTML = "";

            for (let tag of data.tags) {
                still_tags_loader_with_link(searchPanelStillTagContainer, [
                    {
                        text: tag.name,
                        link: `archive?tag=${tag.name}`,
                    },
                ])
            }
        }
        if (data.posts.length == 0) {
            searchPanelContentCardHeader.style.display = "none";
            searchPanelContentCardContainer.innerHTML = "";
        } else {
            searchPanelContentCardHeader.style.display = "flex";
            searchPanelContentCardContainer.innerHTML = "";
            for (let content_card of data.posts) {
                const div = document.createElement("div");
                div.onclick = () => {
                    window.location.href = `/post?post_id=${content_card._id}`;
                };
                div.className = "content-card-2";
                div.style.cursor = "pointer";
                div.innerHTML = content_card_template(content_card);
                searchPanelContentCardContainer.appendChild(div);
            }
        }
        if (data.users.length == 0) {
            searchPanelProfileCardHeader.style.display = "none";
            searchPanelProfileCardContainer.innerHTML = "";
        } else {
            searchPanelProfileCardHeader.style.display = "flex";
            searchPanelProfileCardContainer.innerHTML = "";
            for (let profile_card of data.users) {
                const div = document.createElement("div");
                div.className = "profile-card";
                div.innerHTML = profile_card_template(profile_card);
                searchPanelProfileCardContainer.appendChild(div);
            }
        }
    });

    window.addEventListener("DOMContentLoaded", updatePlaceholder);
    window.addEventListener("resize", updatePlaceholder);
});