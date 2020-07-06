const introDashboard = $('#mc-intro-dashboard');
const insightsCharts1 = $('#mc-desc-insights-1');
const insightsCharts2 = $('#mc-desc-insights-2');

let dashboard_pos_1 = 60;
let dashboard_pos_2 = 120;
let chart_pos = 835;

// When document loads, set the starting position for insight images.
$(e => {
    if (window.innerWidth >= 450) {
        insightsCharts1.css({
            'transform': 'translateX(22.5%)',
            'opacity': '100%'
        });
        insightsCharts2.css({
            'transform': 'translateX(100%)',
            'opacity': '0%',
            'width': '0'
        });
    }
});

// Dynamic image styling.
$(window).scroll(e => {
    let scrollY = $(window).scrollTop();

    if (scrollY <= dashboard_pos_1) {
        introDashboard.attr("src", "images/sesh-dashboard-1.png");
    } else if (scrollY > dashboard_pos_1 & scrollY <= dashboard_pos_2) {
        introDashboard.attr("src", "images/sesh-dashboard-2.png");
    } else if (scrollY > dashboard_pos_2) {
        introDashboard.attr("src", "images/sesh-dashboard-3.png");
        if (window.innerWidth >= 450) {
            insightsCharts2.css({
                'width': '70%'
            });
        }
    }

    if (window.innerWidth >= 450) {
        if (scrollY <= chart_pos) {
            insightsCharts1.css({
                'transform': 'translateX(22.5%)',
                'opacity': '100%'
            });
            insightsCharts2.css({
                'transform': 'translateX(100%)',
                'opacity': '0%'
            });
        } else if (scrollY > chart_pos) {

            insightsCharts1.css({
                'transform': 'translateX(-100%)',
                'opacity': '0%'
            });
            insightsCharts2.css({
                'transform': 'translateX(-77.5%)',
                'opacity': '100%',
                'width': '70%'
            });
        }
    }
});