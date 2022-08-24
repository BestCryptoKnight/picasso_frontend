import React, { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import cx from 'classnames';
import { ethers } from 'ethers';
import Skeleton from 'react-loading-skeleton';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  CheckCircle as CheckCircleIcon,
  BusinessCenter as BusinessCenterIcon,
  Sync as SyncIcon,
} from '@material-ui/icons';
import Loader from 'react-loader-spinner';
import Carousel, { Dots } from '@brainhubeu/react-carousel';
import '@brainhubeu/react-carousel/lib/style.css';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { useHistory } from 'react-router-dom';

import Clock from 'components/Clock';
import Button from '@material-ui/core/Button';
import SuspenseImg from 'components/SuspenseImg';
import BootstrapTooltip from 'components/BootstrapTooltip';
import {
  formatNumber,
  getRandomIPFS,
  shortenAddress,
  shortenName,
  isAddress,
} from 'utils';
import { useApi } from 'api';
import { useAuctionContract } from 'contracts';
import useTokens from 'hooks/useTokens';

import iconPlus from 'assets/svgs/plus.svg';
import wFTMLogo from 'assets/imgs/wftm.png';
import nftActiveIcon from 'assets/svgs/nft_active.svg';

import styles from './styles.module.scss';

const ONE_MIN = 60;
const ONE_HOUR = ONE_MIN * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_MONTH = ONE_DAY * 30;

const BaseCard = ({ item, loading, style, create, onCreate, onLike }) => {
  const { storageUrl, likeItem, likeBundle } = useApi();
  const { getAuction } = useAuctionContract();
  const { getTokenByAddress } = useTokens();

  const [now, setNow] = useState(new Date());
  const [fetching, setFetching] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [info, setInfo] = useState(null);
  const [index, setIndex] = useState(0);
  const [isLike, setIsLike] = useState(false);
  const [liked, setLiked] = useState(0);
  const [auction, setAuction] = useState(null);

  const { collections } = useSelector(state => state.Collections);
  const { authToken } = useSelector(state => state.ConnectWallet);
  const { account } = useWeb3React();

  const history = useHistory();

  const collection = collections.find(
    col => col.address === item?.contractAddress
  );

  const getTokenURI = async tokenURI => {
    setFetching(true);
    try {
      tokenURI = getRandomIPFS(tokenURI);

      const { data } = await axios.get(tokenURI);

      if (data[Object.keys(data)[0]].image) {
        data.image = getRandomIPFS(data[Object.keys(data)[0]].image);
        data.name = data[Object.keys(data)[0]].name;
      }

      if (data.properties && data.properties.image) {
        data.image = getRandomIPFS(data.properties.image.description);
      }

      setInfo(data);
    } catch {
      setInfo(null);
    }
    setFetching(false);
  };

  const getCurrentAuction = async () => {
    try {
      const _auction = await getAuction(item.contractAddress, item.tokenID);
      if (_auction.endTime !== 0) {
        const token = getTokenByAddress(_auction.payToken);
        _auction.reservePrice = parseFloat(
          ethers.utils.formatUnits(_auction.reservePrice, token.decimals)
        );
        _auction.token = token;
        setAuction(_auction);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getDefaultTime = async () => {
    if (!window.ethereum) history.push('/404');
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    let curBlockNum = await provider.getBlockNumber();
    let block = await provider.getBlock(curBlockNum);
    let curTime = block.timestamp;
    setNow(new Date(curTime * 1000));

    // provider.on('block', blockNum => {
    //   provider.getBlock(blockNum).then(res => {
    //     setNow(new Date(res.timestamp * 1000));
    //   });
    // });
  };

  useEffect(() => {
    async function fetchMyAPI() {
      if (item && !item.name) {
        await getTokenURI(item.tokenURI);
      }
      if (item) {
        if (item.imageURL) {
          // eslint-disable-next-line require-atomic-updates
          item.imageURL = getRandomIPFS(item.imageURL);
        }

        setLiked(item.liked);
        if (item.items) {
          setAuction(null);
        } else {
          getCurrentAuction();
        }
      }
    }
    fetchMyAPI();
  }, [item]);

  useEffect(() => {
    if (item?.isLiked !== undefined) {
      setIsLike(item.isLiked);
    }
  }, [item?.isLiked]);

  useEffect(() => {
    // setInterval(() => {
    //   setNow(new Date());
    // }, 1000);
    getDefaultTime();
  }, []);

  useEffect(() => {
    const timerObj = setTimeout(() => {
      setNow(new Date(now.getTime() + 1000));
    }, 1000);

    return () => clearTimeout(timerObj);
  }, [now]);

  const auctionStarted = now.getTime() / 1000 >= auction?.startTime;

  const auctionEnded = auction?.endTime <= now.getTime() / 1000;

  const auctionActive = auctionStarted && !auctionEnded;

  const toggleFavorite = async e => {
    e.preventDefault();
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (item.items) {
        const { data } = await likeBundle(item._id, authToken);
        setLiked(data);
      } else {
        const { data } = await likeItem(
          item.contractAddress,
          item.tokenID,
          authToken
        );
        setLiked(data);
      }
    } catch (err) {
      console.log(err);
    }
    setIsLike(!isLike);
    setIsLiking(false);

    onLike && onLike();
  };

  const formatDiff = diff => {
    if (diff >= ONE_MONTH) {
      const m = Math.ceil(diff / ONE_MONTH);
      return `${m} Month${m > 1 ? 's' : ''}`;
    }
    if (diff >= ONE_DAY) {
      const d = Math.ceil(diff / ONE_DAY);
      return `${d} Day${d > 1 ? 's' : ''}`;
    }
    if (diff >= ONE_HOUR) {
      const h = Math.ceil(diff / ONE_HOUR);
      return `${h} Hour${h > 1 ? 's' : ''}`;
    }
    if (diff >= ONE_MIN) {
      const h = Math.ceil(diff / ONE_MIN);
      return `${h} Min${h > 1 ? 's' : ''}`;
    }
    return `${diff} Second${diff > 1 ? 's' : ''}`;
  };

  const formatDuration = endTime => {
    const diff = endTime - Math.floor(now.getTime() / 1000);
    return formatDiff(diff);
  };

  const renderSlides = () => {
    return item.items.map((v, idx) => (
      <div className={styles.imageBox} key={idx}>
        {(v.imageURL || v.thumbnailPath?.length > 10) &&
          (v.imageURL?.includes('youtube') ? (
            <ReactPlayer
              className={styles.media}
              url={v.imageURL}
              controls={true}
              width="100%"
              height="100%"
            />
          ) : (
            <Suspense
              fallback={
                <Loader
                  type="Oval"
                  color="#007BFF"
                  height={32}
                  width={32}
                  className={styles.loader}
                />
              }
            >
              <SuspenseImg
                src={
                  v.thumbnailPath?.length > 10
                    ? `${storageUrl}/image/${v.thumbnailPath}`
                    : v.imageURL
                }
                className={styles.media}
                alt={v.name}
              />
            </Suspense>
          ))}
      </div>
    ));
  };

  const renderDots = () => {
    return item.items.map((v, idx) => (
      <div className={cx(styles.dot)} key={idx} />
    ));
  };

  const renderContent = () => {
    return (
      <>
        <div className={styles.clockWrapper}>
          {auctionActive && (
            // formatDuration(auction.endTime)
            <>
              <Clock
                leftTime={auction.endTime - now.getTime() / 1000}
                type={1}
              />
            </>
          )}
        </div>
        {item.items ? (
          <>
            <Carousel
              className={styles.carousel}
              plugins={['fastSwipe']}
              value={index}
              onChange={_index => setIndex(Math.min(Math.max(_index, 0), 2))}
              slides={renderSlides()}
              numberOfInfiniteClones={1}
            />
            <Dots
              className={styles.dots}
              value={index}
              onChange={setIndex}
              number={Math.min(item.items.length, 18)}
              thumbnails={renderDots()}
            />
          </>
        ) : (
          <div className={styles.imageBox}>
            {(item?.imageURL ||
              info?.image ||
              item?.thumbnailPath?.length > 10 ||
              item?.thumbnailPath === 'embed') &&
              (item?.thumbnailPath === 'embed' ? (
                <iframe src={item?.imageURL} className={styles.media} />
              ) : (item?.imageURL || info?.image)?.includes('youtube') ? (
                <ReactPlayer
                  className={styles.media}
                  url={item?.imageURL || info?.image}
                  controls={true}
                  width="100%"
                  height="100%"
                />
              ) : (
                <Suspense
                  fallback={
                    <Loader
                      type="Oval"
                      color="#007BFF"
                      height={32}
                      width={32}
                      className={styles.loader}
                    />
                  }
                >
                  <SuspenseImg
                    src={
                      item?.thumbnailPath?.length > 10
                        ? `${storageUrl}/image/${item.thumbnailPath}`
                        : item?.imageURL || info?.image
                    }
                    className={styles.media}
                    alt={item?.name}
                  />
                </Suspense>
              ))}
            <div className={styles.liked} onClick={toggleFavorite}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}&nbsp;
              {item?.liked}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      style={style}
      className={cx(styles.root)}
      onClick={onCreate}
    >
      {loading || fetching ? (
        <Skeleton width="100%" height="100%" className={styles.mediaLoading} />
      ) : (
        <>
          <div className={styles.card}>
            {create ? (
              <div className={styles.createBtn}>
                <div className={styles.createIcon}>
                  <img src={iconPlus} />
                </div>
                <div className={styles.createLabel}>Create Bundle</div>
              </div>
            ) : item ? (
              <Link
                to={
                  item.items
                    ? `/bundle/${item._id}`
                    : `/explore/${item.contractAddress}/${item.tokenID}`
                }
                className={styles.link}
              >
                {renderContent()}
              </Link>
            ) : (
              renderContent()
            )}
          </div>
          <div className={styles.flexBetween}>
            <h5>{`"${shortenName(item.name)}"`}</h5>
            <div className={styles.netLogo}>FTM</div>
          </div>
          <div className={styles.flexBetween}>
            <div className={styles.flexRow}>
              <img
                src={
                  collection?.logoImageHash
                    ? `${getRandomIPFS('', true)}${collection.logoImageHash}`
                    : nftActiveIcon
                }
                alt="Collection"
                className={styles.collectionAvatar}
              />
              <div className={styles.info}>
                <span>Owned By</span>
                <h6>
                  {item.alias
                    ? shortenName(item.alias)
                    : isAddress(item.owner)
                      ? shortenAddress(item.owner)
                      : item.owner}
                </h6>
              </div>
            </div>
            <div className={styles.info} style={{ textAlign: 'right' }}>
              <span>Current Bid</span>
              <h6>
                {formatNumber(
                  auctionActive ? auction.reservePrice : item.price.toFixed(2)
                )}
                &nbsp;FTM
              </h6>
            </div>
          </div>
          {auctionActive &&
            (account != auction?.owner ? (
              <div className={styles.flexBetween}>
                <Link
                  to={
                    item.items
                      ? `/bundle/${item._id}`
                      : `/explore/${item.contractAddress}/${item.tokenID}`
                  }
                >
                  <div className={styles.actionButton}>
                    <BusinessCenterIcon style={{ marginRight: '10px' }} /> Place
                    Bid
                  </div>
                </Link>
                <Link
                  to={
                    item.items
                      ? `/bundle/${item._id}`
                      : `/explore/${item.contractAddress}/${item.tokenID}`
                  }
                >
                  <div className={styles.history}>
                    <SyncIcon
                      style={{ marginRight: '10px', fontSize: '20px' }}
                    />{' '}
                    View History
                  </div>
                </Link>
              </div>
            ) : (
              <div></div>
            ))}
          {/* <div className={styles.content}>
          {loading || fetching ? (
            <Skeleton width={100} height={20} />
          ) : (
            <div className={styles.name}>{item?.name || info?.name}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {auction?.reservePrice || item?.price ? (
              <div className={styles.priceWrapper}>
                {!loading && <div style={{ marginRight: '10px' }}>Price:</div>}
                {loading || fetching ? (
                  <Skeleton width={80} height={20} />
                ) : (
                  <div className={cx(styles.label, styles.price)}>
                    <img
                      src={
                        auctionActive
                          ? auction?.token?.icon
                          : getTokenByAddress(item?.paymentToken)?.icon ||
                            wFTMLogo
                      }
                    />
                    {formatNumber(
                      auctionActive
                        ? auction.reservePrice
                        : item.price.toFixed(2)
                    )}
                  </div>
                )}
              </div>
            ) : (
              ''
            )}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {!item ? (
                <Skeleton width={80} height={20} />
              ) : (
                <>
                  {isLike ? (
                    <FavoriteIcon
                      className={styles.favIcon}
                      onClick={toggleFavorite}
                    />
                  ) : (
                    <FavoriteBorderIcon
                      className={styles.favIcon}
                      onClick={toggleFavorite}
                    />
                  )}
                  <span className={styles.favLabel}>{liked || 0}</span>
                </>
              )}
            </div>
          </div>
        </div> */}
          {/* <div className={cx(styles.cardHeader, isLike && styles.liking)}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  className={styles.collectionAvatar}
                  src={
                    collection?.logoImageHash
                      ? `${getRandomIPFS('', true)}${collection.logoImageHash}`
                      : nftActiveIcon
                  }
                />{' '}
                <div style={{ fontSize: '20px', fontWeight: '700' }}>
                  {collection?.collectionName || collection?.name}
                </div>
              </div>
            </div> */}
          {/* {item?.tokenType === 1155 && (
            <>
              <div className={styles.card} />
              <div className={styles.card} />
            </>
          )} */}
        </>
      )}
    </div>
  );
};

export default React.memo(BaseCard);
