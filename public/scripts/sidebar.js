let dashActivated = true;

// Toggle the left dashboard sidebar.
function toggleDashboard() {
    let width = window.innerWidth;
    console.log(width);
    if (!dashActivated) {
        $('.navbar').css('margin-left', '250px');
        $('#sidebar').css('width', '250px');
        $('#main-container').css('margin-left', '270px');
        if (width <= 500) {
            $('#main-container').css('opacity', '0%');
            $('.navbar-links').css('opacity', '0%');
        }
        dashActivated = true;
    } else {
        $('.navbar').css('margin-left', '0px');
        $('#sidebar').css('width', '0px');
        $('#main-container').css('margin-left', '20px');
        if (width <= 500) {
            $('#main-container').css('opacity', '100%');
            $('.navbar-links').css('opacity', '100%');
        }
        dashActivated = false;
    }
}

// Set onclick functions.
$('#sidebar-toggler').click(toggleDashboard);


console.log(window.innerWidth);
if (window.innerWidth <= 500) {
    toggleDashboard();
}