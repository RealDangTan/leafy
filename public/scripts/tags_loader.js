/**
 * Loads tags into a specified HTML element.
 * 
 * @param {HTMLElement} elem - The HTML element where the tags will be appended.
 * @param {Array<Object>} datas - An array of objects representing the tag data.
 * @param {string} datas[].text - The text content of the tag.
 * @param {string} datas[].link - The URL to be assigned to the tag's link.
 */
function still_tags_loader_with_link(elem, datas) {
    for (let data of datas) {
        let tag = document.createElement("button");

        let a = document.createElement("a");
        a.href = data.link;
        if (a.target) a.target = "_blank";
        
        tag.className = "still-content-tag";
        tag.innerText = data.text;

        a.appendChild(tag);
        elem.appendChild(a);
    }
}
function still_tags_loader_no_link(elem, datas) {
    for (let data of datas) {
        let tag = document.createElement("button");
        tag.className = "still-content-tag";
        tag.innerText = data;
        elem.appendChild(tag);
    }
}

export { still_tags_loader_with_link , still_tags_loader_no_link };