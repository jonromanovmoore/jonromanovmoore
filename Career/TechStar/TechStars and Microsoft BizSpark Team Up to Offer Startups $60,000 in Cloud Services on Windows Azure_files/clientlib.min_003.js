
$(document).ready(function () {
    newsMarquee();

    $(document).on("click", ".play-marquee", function () {
        let marquee = document.getElementById('marqueeNews');
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            marquee.stop();
        } else {
            marquee.start();
        }
    });
});

function newsMarquee() {

    if ($('.announced-live').length > 0) {
        var ulWidth = 0;
        $('.announced-live ul li').each(function () {
            ulWidth += $(this).outerWidth();
        });

        var containerWidth = $('.announced-live').outerWidth();
        let marquee = document.getElementById('marqueeNews');

        $('.play-marquee').hide();
        if (ulWidth > containerWidth) {
            $('.play-marquee').show().removeClass('active');
            var getSpeedVal = $('.announced-live').attr('data-speedMarquee') ? $('.announced-live').attr('data-speedMarquee') : 6;
            $('#marqueeNews').each(function () {
                $(this).replaceWith("<marquee id='marqueeNews'  direction='left' scrolldelay='4' scrollamount=" + getSpeedVal + " behavior='scroll'>" + $(this).html() + "</marquee>");
            });
            let marquee = document.getElementById('marqueeNews');
            $('.announced-live ul li a').mouseover(function () {
                marquee.stop();
                $('.play-marquee').addClass('active');
            }).mouseout(function () {
                marquee.start();
                $('.play-marquee').removeClass('active');
            });
        } else {
            $('#marqueeNews').each(function () {
                $(this).replaceWith("<div id='marqueeNews'>" + $(this).html() + "</div>");
                $('.play-marquee').hide();
            });
        }
    }

}

window.onresize = function () {

    newsMarquee();

}