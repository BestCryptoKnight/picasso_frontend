import React from 'react';
import { Line } from 'recharts';
import { Link } from 'react-router-dom';

// import { useDispatch } from 'react-redux';

// import { NavLink, useHistory } from 'react-router-dom';
// import Mailto from 'react-mailto';
// import cx from 'classnames';

import styles from './styles.module.scss';

const Footer = () => {
  return (
    <div className="container pb2" style={{ overflow: 'hidden', position: 'relative' }}>
      <div className={'row'}>

        <div className={"mt2 col-sm-6 col-md-4 col-lg-3 col-xl-3" + styles.socialIcons}>
          <div className='cu-po dis-f ai-c jc-s gap5'>
            <a className='td-n' href="https://twitter.com/picassoftm">
              <img
                src="/assets/images/footer/twitter.png"
                alt=""
                width="24px"
                height="24px"
              />
              <span className={styles.footer_font}>
                &nbsp;&nbsp;Twitter
              </span>
            </a>
          </div>
          <div className='cu-po dis-f ai-c jc-s gap5'>
            <img
              src="/assets/images/footer/discord.png"
              alt=""
              width="24px"
              height="24px"
            />
            <span className={styles.footer_font}>
              Discord
            </span>
          </div>
        </div>

        <div className={"mt2 col-sm-6 col-md-4 col-lg-3 col-xl-3" + styles.socialIcons}>
          <div className='cu-po dis-f ai-c jc-s gap5'>
            ✔
            <span className={styles.footer_font}>
              Home
            </span>
          </div>
          <div className='cu-po dis-f ai-c jc-s gap5'>
            ✔
            <span className={styles.footer_font}>
              Explore
            </span>
          </div>
          <div className='cu-po dis-f ai-c jc-s gap5'>
            ✔
            <span className={styles.footer_font}>
              Activity
            </span>
          </div>
          <div className='cu-po dis-f ai-c jc-s gap5'>
            ✔
            <span className={styles.footer_font}>
              Creative
            </span>
          </div>
        </div>

        <div className={"mt2 col-sm-6 col-md-4 col-lg-3 col-xl-3" + styles.socialIcons}>
          <div className='cu-po dis-f ai-c jc-s gap5'>
            <span className={styles.footer_font}>
              Feel free to send us an email :
            </span>
          </div>
          <div className='cu-po dis-f ai-c jc-s gap5'>
            <span className={styles.footer_font}>
              Jb.mouny@yahoo.com
            </span>
          </div>
        </div>

      </div>
      <div className={styles.footer_image}>
        <img src="/assets/images/footer/building.svg" alt="" width="448px" height="352px" />
      </div>


    </div >









    // <div className={styles.container}>
    //   <div className={styles.footerBottom}>
    //     <div className={styles.footerCont}>
    //       <div className={styles.footerText}>
    //         &copy;{new Date().getFullYear()} Picasso. All rights reserved ||
    //         Designed By: Spagetti
    //       </div>
    //       <div className={styles.socialLinks}>
    //         <div className={styles.socialIcons}>
    //           <div>
    //             <a href="https://twitter.com/picassoftm">
    //               <img
    //                 src="/assets/images/footer/twitter.png"
    //                 className={styles.socialIcon}
    //               />
    //             </a>
    //             <a href="https://discord.com/invite/pumpkins">
    //               <img
    //                 src="/assets/images/footer/discord.png"
    //                 className={styles.socialIcon}
    //               />
    //             </a>
    //           </div>
    //           <div> Join our discord for support </div>{' '}
    //         </div>
    //         <div>
    //           Feel free to send us an email :{' '}
    //           <a
    //             href="https://mailto:jb.mouny@yahoo.com"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             style={{ color: 'darkblue' }}
    //           >
    //             Jb.mouny@yahoo.com
    //           </a>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Footer;
