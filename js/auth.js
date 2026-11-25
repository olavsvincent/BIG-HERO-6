
document.addEventListener("DOMContentLoaded", () => {

    // PORTFOLIO TRANSITION

    const cards = document.querySelectorAll(".hero-card");

    const overlay = document.createElement("div");
    overlay.className = "transition-overlay";

    overlay.innerHTML = `
        <div class="loader-ring"></div>
        <p class="loading-text">OPENING PORTFOLIO</p>
    `;

    document.body.appendChild(overlay);

    let isPortfolioOpening = false;

    cards.forEach((card) => {
        card.addEventListener("click", (event) => {
            const link = card.getAttribute("href");

            if (!link || link.includes("example.com")) {
                event.preventDefault();
                alert("Please add the actual portfolio link first.");
                return;
            }

            if (isPortfolioOpening) {
                event.preventDefault();
                return;
            }

            event.preventDefault();
            isPortfolioOpening = true;

            card.classList.add("selected");
            document.body.classList.add("leaving");

            setTimeout(() => {
                overlay.classList.add("active");
            }, 200);

            setTimeout(() => {
                window.open(link, "_blank", "noopener,noreferrer");

                document.body.classList.remove("leaving");
                card.classList.remove("selected");
                overlay.classList.remove("active");

                isPortfolioOpening = false;
            }, 1100);
        });
    });


    // EXPLORE THE TEAM

    const exploreButton = document.querySelector(".hero-button");
    const portfolioSection = document.getElementById("portfolios");

    if (exploreButton && portfolioSection) {
        exploreButton.addEventListener("click", (event) => {
            event.preventDefault();

            portfolioSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }


    // FUTURISTIC TEAM ROSTER CAROUSEL

    const track = document.getElementById("rosterTrack");
    const viewport = document.querySelector(".roster-viewport");
    const rosterCards = document.querySelectorAll(".hero-card");

    const nextButton = document.getElementById("rosterNext");
    const prevButton = document.getElementById("rosterPrev");

    const counter = document.getElementById("rosterCounter");
    const pagination = document.querySelectorAll(".pagination-line");

    if (!track || !viewport || !rosterCards.length || !nextButton || !prevButton) {
        return;
    }

    let currentIndex = 0;
    let isAnimating = false;

    // CREATE RED LIGHT SWEEP

    const lightSweep = document.createElement("div");

    lightSweep.className = "roster-light-sweep";

    lightSweep.style.cssText = `
        position: absolute;
        inset: 0;
        z-index: 5;
        pointer-events: none;
        opacity: 0;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(229, 35, 50, 0.04) 30%,
            rgba(229, 35, 50, 0.55) 50%,
            rgba(255, 255, 255, 0.15) 52%,
            rgba(229, 35, 50, 0.04) 70%,
            transparent 100%
        );
        transform: translateX(-110%);
    `;

    viewport.appendChild(lightSweep);


    // UPDATE POSITION AND INFORMATION

    function updateRoster() {
        const slideWidth = viewport.clientWidth;

        track.style.transition = "none";

        track.style.transform =
            `translateX(-${currentIndex * slideWidth}px)`;

        if (counter) {
            counter.textContent =
                `${String(currentIndex + 1).padStart(2, "0")} / ${String(rosterCards.length).padStart(2, "0")}`;
        }

        pagination.forEach((line, index) => {
            line.classList.toggle("active", index === currentIndex);
        });
    }


    // PROFILE TRANSITION

    function moveProfile(direction, targetIndex = null) {

        if (isAnimating) return;

        let nextIndex;

        if (targetIndex !== null) {
            nextIndex = targetIndex;
        } else {
            nextIndex =
                (currentIndex + direction + rosterCards.length) %
                rosterCards.length;
        }

        if (nextIndex === currentIndex) return;

        isAnimating = true;

        const previousCard = rosterCards[currentIndex];
        const nextCard = rosterCards[nextIndex];

        const slideDirection = direction >= 0 ? 1 : -1;

        // OUTGOING PROFILE

        const exitAnimation = previousCard.animate(
            [
                {
                    opacity: 1,
                    transform: "translateX(0) scale(1)",
                    filter: "blur(0px)"
                },
                {
                    opacity: 0,
                    transform: `translateX(${-slideDirection * 65}px) scale(0.96)`,
                    filter: "blur(9px)"
                }
            ],
            {
                duration: 260,
                easing: "cubic-bezier(.65, 0, .35, 1)",
                fill: "forwards"
            }
        );

        // RED LIGHT SWEEP

        lightSweep.animate(
            [
                {
                    opacity: 0,
                    transform: "translateX(-110%)"
                },
                {
                    opacity: 1,
                    transform: "translateX(0%)"
                },
                {
                    opacity: 0,
                    transform: "translateX(110%)"
                }
            ],
            {
                duration: 650,
                easing: "ease-in-out"
            }
        );

        exitAnimation.onfinish = () => {

            // CHANGE PROFILE

            currentIndex = nextIndex;

            updateRoster();

            // INCOMING PROFILE

            nextCard.animate(
                [
                    {
                        opacity: 0,
                        transform: `translateX(${slideDirection * 65}px) scale(0.96)`,
                        filter: "blur(9px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateX(0) scale(1)",
                        filter: "blur(0px)"
                    }
                ],
                {
                    duration: 600,
                    easing: "cubic-bezier(.16, 1, .3, 1)",
                    fill: "both"
                }
            );

            setTimeout(() => {
                isAnimating = false;
            }, 620);
        };
    }


    // NEXT AND BACK BUTTONS

    nextButton.addEventListener("click", () => {
        moveProfile(1);
    });

    prevButton.addEventListener("click", () => {
        moveProfile(-1);
    });


    // CLICKABLE PAGINATION

    pagination.forEach((line, index) => {
        line.style.cursor = "pointer";

        line.addEventListener("click", () => {
            const direction = index > currentIndex ? 1 : -1;
            moveProfile(direction, index);
        });
    });


    // KEYBOARD NAVIGATION

    document.addEventListener("keydown", (event) => {

        if (event.key === "ArrowRight") {
            moveProfile(1);
        }

        if (event.key === "ArrowLeft") {
            moveProfile(-1);
        }
    });


    // TOUCH SWIPE NAVIGATION

    let touchStartX = 0;

    viewport.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener("touchend", (event) => {

        const touchEndX = event.changedTouches[0].screenX;
        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) > 50) {
            if (difference > 0) {
                moveProfile(1);
            } else {
                moveProfile(-1);
            }
        }

    }, { passive: true });


    // RESPONSIVE POSITION

    window.addEventListener("resize", () => {
        if (!isAnimating) {
            updateRoster();
        }
    });


    // INITIALIZE

    updateRoster();


    // BAYMAX VIDEO LOOP

    const baymaxVideo = document.getElementById("baymaxVideo");

    if (baymaxVideo) {

        const fadeDuration = 0.8;
        let isFading = false;

        baymaxVideo.addEventListener("timeupdate", () => {

            if (!baymaxVideo.duration) return;

            const remaining =
                baymaxVideo.duration - baymaxVideo.currentTime;

            if (remaining <= fadeDuration && !isFading) {
                isFading = true;
                baymaxVideo.classList.add("fade-out");
            }
        });

        baymaxVideo.addEventListener("ended", async () => {

            baymaxVideo.currentTime = 0;

            try {
                await baymaxVideo.play();

                requestAnimationFrame(() => {
                    baymaxVideo.classList.remove("fade-out");
                    isFading = false;
                });

            } catch (error) {
                console.log("Baymax video could not restart.", error);
            }
        });

        baymaxVideo.play().catch(() => {
            console.log("Video autoplay was prevented.");
        });
    }

});
