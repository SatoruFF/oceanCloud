import { Anchor, Button, message } from "antd";
import { LazyMotion, domAnimation, motion } from "framer-motion";

import ParticleEffect from "../components/UI/ParticleEffect";

import mainLogo from "../assets/sea-turtle.png";
import desktopIcon from "../assets/desktop.png";
import mobileIcon from "../assets/mobile-phone.png";
import storageIcon from "../assets/cloud-data.png";
import telegramLogo from "../assets/telegram.png";
import twitterLogo from "../assets/twitter.png";
import gitIcon from "../assets/github-icon.png";

import styles from "../style/welcome.module.scss";
import cn from "classnames";

const Welcome = () => {
  return (
    <div className={cn(styles.welcomeWrapper)}>
      <Anchor
        className={cn(styles.welcomeAnchor)}
        items={[
          {
            key: "part-1",
            href: "#part-1",
            title: "Title",
          },
          {
            key: "part-2",
            href: "#part-2",
            title: "More",
          },
          {
            key: "part-3",
            href: "#part-3",
            title: "About",
          },
        ]}
      />
      <div className={cn(styles.welcomeMain)} id="part-1">
        <svg
          className={cn(styles.wave)}
          viewBox="0 0 2 1"
          preserveAspectRatio="none"
        >
          <defs>
            <path
              id="w"
              d="
            m0 1v-.5 
            q.5.5 1 0
            t1 0 1 0 1 0
            v.5z"
            />
          </defs>
          <g>
            <use href="#w" y=".0" fill="#2d55aa" />
            <use href="#w" y=".1" fill="#3461c1" />
            <use href="#w" y=".2" fill="#4579e2" />
          </g>
        </svg>
        <div className={cn(styles.contextMax)}>
          <div
            className={cn(
              styles.welcomeCard,
              "animate__animated animate__fadeIn"
            )}
          >
            <div className={cn(styles.leftSide)}>
              <div className={cn(styles.welcomeTitle)}>Mello</div>
              <div
                className={cn(
                  styles.welcomeDescription,
                  "animate__animated animate__fadeInDown"
                )}
              >
                Mello - its a nice web cloud for everyone. each person is given
                as much as 100 free megabytes.
              </div>
            </div>
            <div className={cn(styles.rightSide)}>
              <LazyMotion features={domAnimation}>
                <motion.img src={mainLogo} animate={{ opacity: 1 }} />
              </LazyMotion>
            </div>
          </div>
        </div>
      </div>

      {/* second content space */}
      <div className={cn(styles.welcomeMore)} id="part-2">
        <ParticleEffect />
        <div className={cn(styles.moreTitle)}>Want more?</div>
        <div className={cn(styles.contentMax)}>
          <div className={cn(styles.moreContent)}>
            <div className={cn(styles.moreDesktopCard)}>
              <img src={desktopIcon} alt="desktop" loading="lazy" />
              <div className={cn(styles.moreDescription)}>
                You can also download desktop applications by clicking the
                button below
              </div>
              <Button
                type="primary"
                onClick={() => message.info("coming soon...")}
              >
                download
              </Button>
            </div>

            <div className={cn(styles.moreMobileCard)}>
              <img src={mobileIcon} alt="mobile" loading="lazy" />
              <div className={cn(styles.moreDescription)}>
                And there is also a mobile cloud storage application
              </div>
              <Button type="primary">
                <a href="https://wdfiles.ru/775e318" target="_blank">
                  download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* third content space */}
      <div className={cn(styles.welcomeAbout)} id="part-3">
        <div className={cn(styles.aboutTitle)}>About</div>
        <div className={cn(styles.contentMax)}>
          <div className={cn(styles.aboutContent)}>
            <div className={cn(styles.aboutDescription)}>
              Ocean Cloud is a cloud storage that allows users to store and
              manage their data in a cloud environment. It provides high-level
              security and data access control functions, as well as guarantees
              high availability and scalability. The main advantages of Ocean
              Cloud are: <br />
              ·Flexibility and Scalability: Ocean Cloud allows users to easily
              scale their storage to meet growing data storage needs, expanding
              storage capacity as needed.
              <br />
              ·Security: Ocean Cloud provides a high level of data security
              thanks to data encryption at rest and in motion, traffic filtering
              and the ability to control access to data at the user level.
              <br />
              ·Usability: Ocean Cloud has a simple and intuitive interface that
              allows users to easily upload, store and manage their data without
              requiring special knowledge and skills.
            </div>
            <div className={cn(styles.aboutLinks, "aboutLinks")}>
              <img
                src={storageIcon}
                alt="storage"
                loading="lazy"
                className={cn(styles.storageLogo)}
              />
              <div className={cn(styles.socials, "socials")}>
                <div className={cn(styles.socialsItem)}>
                  <a href="https://t.me/AlexDayy" target="_blank">
                    <img src={telegramLogo} alt="telegram" loading="lazy" />
                  </a>
                </div>
                <div className={cn(styles.socialsItem)}>
                  <a href="https://github.com/SatoruFF" target="_blank">
                    <img src={gitIcon} alt="instagram" loading="lazy" />
                  </a>
                </div>
                <div className={cn(styles.socialsItem)}>
                  <img src={twitterLogo} alt="twitter" loading="lazy" />{" "}
                </div>
              </div>
              <div className={cn(styles.aboutSignature)}>Made by SatoruF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
