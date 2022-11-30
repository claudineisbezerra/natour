function toggleCheckboxes(elSource, elName) {
    checkboxes = document.getElementsByName(elName);
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        checkboxes[i].checked = elSource.checked;
    }
}


//- Hide/Show form sections
// function show(classElement, action) {
//   console.log('show action: ', action);
//   console.log('show action: '+ action);
//   let sections = document.getElementsByClassName(classElement);
//   console.log('show sections: ', sections)
//   sections.forEach(section => {
//     if (action.includes('list')) {
//       section.style.display = "none";
//     } else {
//       section.style.display = "block";
//     }
//   }); 
// }

