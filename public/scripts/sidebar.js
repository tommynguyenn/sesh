let dashActivated = true;

// Toggle the left dashboard sidebar.
function toggleDashboard() {
    if (!dashActivated) {
        $('#sidebar').css('width', '250px');
        $('#main-container').css('margin-left', '270px');
        dashActivated = true;
    } else {
        $('#sidebar').css('width', '0px');
        $('#main-container').css('margin-left', '20px');
        dashActivated = false;
    }
}

// Set onclick functions.
$('#sidebar-toggler').click(toggleDashboard);