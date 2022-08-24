import React, { useEffect, useState, useRef } from 'react';
import { useHistory, withRouter, NavLink, Link } from 'react-router-dom';
import cx from 'classnames';
import Skeleton from 'react-loading-skeleton';
import { Menu } from '@material-ui/core';
import { useWeb3React } from '@web3-react/core';
import { ExpandMore, Search as SearchIcon, } from '@material-ui/icons';
import MenuIcon from '@mui/icons-material/Menu';
import { useDispatch, useSelector } from 'react-redux';
// import StickyBox from 'react-sticky-box';
import axios from 'axios';

import { picassoGateway } from 'constants/ipfs.constants';
import WalletConnectActions from 'actions/walletconnect.actions';
import AuthActions from 'actions/auth.actions';
import ModalActions from 'actions/modal.actions';
import { shortenAddress, getRandomIPFS } from 'utils';
import { useApi } from 'api';
import { NETWORK_LABEL } from 'constants/networks';
import { ADMIN_ADDRESS } from 'constants/index';
import WFTMModal from 'components/WFTMModal';
import ModModal from 'components/ModModal';
import BanCollectionModal from 'components/BanCollectionModal';
import BanItemModal from 'components/BanItemModal';
import BanUserModal from 'components/BanUserModal';
import BoostCollectionModal from 'components/BoostCollectionModal';
import ConnectWalletModal from 'components/ConnectWalletModal';
import Identicon from 'components/Identicon';

import iconUser from 'assets/svgs/user.svg';
import iconNotification from 'assets/svgs/notification.svg';
import iconAdd from 'assets/svgs/add.svg';
import iconEdit from 'assets/svgs/edit.svg';
import iconSwap from 'assets/svgs/swap.svg';

import styles from './styles.module.scss';
import FilterActions from '../../actions/filter.actions';

const Header = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const {
    apiUrl,
    storageUrl,
    getAuthToken,
    getAccountDetails,
    getIsModerator,
  } = useApi();
  const { account, chainId, deactivate } = useWeb3React();

  const { user } = useSelector(state => state.Auth);
  let isSearchbarShown = useSelector(state => state.HeaderOptions.isShown);
  const { isModerator } = useSelector(state => state.ConnectWallet);
  const { wftmModalVisible, connectWalletModalVisible } = useSelector(
    state => state.Modal
  );

  const [stikyHeaderStatus, setStikyHeaderStatus] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchBarActive, setSearchBarActive] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [modModalVisible, setModModalVisible] = useState(false);
  const [isBan, setIsBan] = useState(false);
  const [banCollectionModalVisible, setBanCollectionModalVisible] = useState(
    false
  );
  const [banItemModalVisible, setBanItemModalVisible] = useState(false);
  const [banUserModalVisible, setBanUserModalVisible] = useState(false);
  const [unbanUserModalVisible, setUnbanUserModalVisible] = useState(false);
  const [
    boostCollectionModalVisible,
    setBoostCollectionModalVisible,
  ] = useState(false);

  const [isSearchShow, setIsSearchShow] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [cancelSource, setCancelSource] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [tokenDetailsLoading, setTokenDetailsLoading] = useState(false);
  const timer = useRef(null);

  const isMenuOpen = Boolean(anchorEl);

  const login = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken(account);
      const isModerator = await getIsModerator(account);

      dispatch(WalletConnectActions.connectWallet(token, isModerator));
      dispatch(AuthActions.fetchStart());
      try {
        const { data } = await getAccountDetails(token);
        dispatch(AuthActions.fetchSuccess(data));
      } catch {
        dispatch(AuthActions.fetchFailed());
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const init = () => {
    login();
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (account) {
      init();
    } else {
      handleSignOut();
    }
  }, [account, chainId]);

  const handleConnectWallet = () => {
    dispatch(ModalActions.showConnectWalletModal());
  };

  const resetResults = () => {
    setAccounts([]);
    setCollections([]);
    setTokens([]);
    setBundles([]);
  };

  // useEffect(() => {
  //   console.log(tokens);
  // }, [tokens]);

  useEffect(() => {
    resetResults();
  }, [isSearchbarShown]);

  const search = async word => {
    setKeyword(word);

    if (cancelSource) {
      cancelSource.cancel();
    }

    if (word.length === 0) {
      resetResults();

      return;
    }

    try {
      // const cancelTokenSource = axios.CancelToken.source();
      // setCancelSource(cancelTokenSource);

      const {
        data: {
          data, //: { accounts, collections, tokens, bundles },
        },
      } = await axios({
        method: 'post',
        url: `${apiUrl}/info/searchNames`,
        data: JSON.stringify({ name: word }),
        headers: {
          'Content-Type': 'application/json',
        },
        // cancelToken: cancelTokenSource.token,
      });
      Promise.all(
        data?.tokens.map(async token => {
          if (token.imageURL) {
            token.imageURL = getRandomIPFS(token.imageURL);
          }

          if (token.imageURL === '-') {
            const {
              data: { image },
            } = await axios.get(token.tokenURI);

            if (image) {
              // eslint-disable-next-line require-atomic-updates
              token.imageURL = getRandomIPFS(token.imageURL);
            }
          }
        })
      );

      setAccounts(data.accounts || []);
      setCollections(data.collections || []);
      setTokenDetailsLoading(true);
      setTokens(data.tokens || []);
      setBundles(data.bundles || []);
      setTokenDetailsLoading(false);
    } catch (err) {
      console.log(err);
    } finally {
      setCancelSource(null);
    }
  };

  const handleSelectCollection = addr => {
    dispatch(FilterActions.updateCollectionsFilter([addr]));
  };

  const handleSearch = word => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => search(word), 500);
  };

  const handleSignOut = () => {
    deactivate();
    dispatch(WalletConnectActions.disconnectWallet());
    dispatch(AuthActions.signOut());
    handleMenuClose();
  };

  const handleProfileMenuOpen = e => {
    setIsSearchShow(false);
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const goToCreateNft = () => {
    history.push(`/create`);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const goToHome = () => {
    history.push(`/`);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const goToExplore = () => {
    history.push(`/explore`);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const goToActivity = () => {
    history.push(`/activity`);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const goToMyProfile = () => {
    history.push(`/account/${account}`);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const goToNotificationSettings = () => {
    history.push(`/settings/notification`);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const handleCreateCollection = () => {
    history.push('/collection/create');
    setIsSearchShow(false);
    handleMenuClose();
  };

  const handleRegisterCollection = () => {
    history.push('/collection/register');
    setIsSearchShow(false);
    handleMenuClose();
  };

  const openWrapStation = () => {
    dispatch(ModalActions.showWFTMModal());
    setIsSearchShow(false);
    handleMenuClose();
  };

  const addMod = () => {
    setIsAdding(true);
    setModModalVisible(true);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const removeMod = () => {
    setIsAdding(false);
    setModModalVisible(true);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const reviewCollections = () => {
    history.push('/collection/review');
    setIsSearchShow(false);
    handleMenuClose();
  };

  const banCollection = () => {
    setIsBan(true);
    setBanCollectionModalVisible(true);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const unbanCollection = () => {
    setIsBan(false);
    setBanCollectionModalVisible(true);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const banItems = () => {
    setBanItemModalVisible(true);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const banUser = () => {
    setBanUserModalVisible(true);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const unbanUser = () => {
    setUnbanUserModalVisible(true);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const boostCollection = () => {
    setBoostCollectionModalVisible(true);
    setIsSearchShow(false);
    handleMenuClose();
  };

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setStikyHeaderStatus(true);
    } else {
      setStikyHeaderStatus(false);
    }
  };

  const toggleMobileSearch = () => {
    setIsSearchShow(!isSearchShow);
    setAnchorEl(null);
  };

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      // keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      classes={{
        paper: styles.profilemenu,
        list: styles.menuList,
      }}
      style={{ marginTop: '10px' }}
    >
      {account && (
        <div
          className={cx(styles.menuItem, styles.topItem)}
          onClick={goToMyProfile}
        >
          {/* <img src={iconUser} className={styles.menuIcon} /> */}
          My Profile
        </div>
      )}
      {/* <div className={styles.menuItem} onClick={goToNotificationSettings}>
        <img src={iconNotification} className={styles.menuIcon} />
        Notification Settings
      </div> */}
      <div className={styles.mobileMenu}>
        <div className={styles.menuItem} onClick={goToHome}>
          {/* <img src={iconAdd} className={styles.menuIcon} /> */}
          Home
        </div>
        <div className={styles.menuItem} onClick={goToExplore}>
          {/* <img src={iconAdd} className={styles.menuIcon} /> */}
          Explore
        </div>
        <div className={styles.menuItem} onClick={goToActivity}>
          {/* <img src={iconAdd} className={styles.menuIcon} /> */}
          Activity
        </div>
        <div className={styles.menuItem} onClick={goToCreateNft}>
          {/* <img src={iconAdd} className={styles.menuIcon} /> */}
          Create NFT
        </div>
      </div>
      <div className={styles.menuItem} onClick={handleCreateCollection}>
        {/* <img src={iconAdd} className={styles.menuIcon} /> */}
        Create Collection
      </div>
      <div className={styles.menuItem} onClick={handleRegisterCollection}>
        {/* <img src={iconEdit} className={styles.menuIcon} /> */}
        Register Collection
      </div>
      <div className={styles.menuSeparator} />
      <div className={styles.menuItem} onClick={openWrapStation}>
        {/* <img src={iconSwap} className={styles.menuIcon} /> */}
        Buy WFTM
      </div>

      <div className={styles.menuSeparator} />
      {account?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()
        ? [
          // <div key={0} className={styles.menuItem} onClick={addMod}>
          //   Add Mod
          // </div>,
          // <div key={1} className={styles.menuItem} onClick={removeMod}>
          //   Remove Mod
          // </div>,
          // <div
          //   key={2}
          //   className={styles.menuItem}
          //   onClick={reviewCollections}
          // >
          //   Review Collections
          // </div>,
          <div key={3} className={styles.menuItem} onClick={banCollection}>
            Ban Collection
          </div>,
          <div key={4} className={styles.menuItem} onClick={unbanCollection}>
            Unban Collection
          </div>,
          <div key={5} className={styles.menuItem} onClick={banItems}>
            Ban Items
          </div>,
          <div key={6} className={styles.menuItem} onClick={banUser}>
            Ban a user
          </div>,
          <div key={9} className={styles.menuItem} onClick={unbanUser}>
            Unban a user
          </div>,
          // <div key={7} className={styles.menuItem} onClick={boostCollection}>
          //   Boost Collection
          // </div>,
          <div key={8} className={styles.menuSeparator} />,
        ]
        : isModerator
          ? [
            <div key={1} className={styles.menuItem} onClick={banCollection}>
              Ban Collection
            </div>,
            <div key={2} className={styles.menuItem} onClick={banItems}>
              Ban Items
            </div>,
            <div key={3} className={styles.menuItem} onClick={banUser}>
              Ban a user
            </div>,
            <div key={6} className={styles.menuItem} onClick={unbanUser}>
              Unban a user
            </div>,
            <div key={4} className={styles.menuSeparator} />,
          ]
          : null}
      <div className={styles.menuItem} onClick={handleSignOut}>
        Sign Out
      </div>
      {/* <div className={styles.signOut} onClick={handleSignOut}>
        Sign Out
      </div> */}
    </Menu>
  );

  const renderSearchBox = () => (
    <div className={cx(styles.searchcont, searchBarActive && styles.active) + ' w10'}>
      <div className={styles.searchcontinner}>
        <div className={styles.searchbar}>
          <input
            placeholder="Search items and accounts"
            // placeholder="Search items, collections and accounts"
            className={styles.searchinput}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => setSearchBarActive(true)}
            onBlur={() => setTimeout(() => setSearchBarActive(false), 200)}
          />
          <SearchIcon fill='black' className={`${styles.searchicon}`} />
        </div>
        {/* {false && ( */}
        {searchBarActive && (
          <div className={styles.resultcont}>
            {collections.length > 0 && (
              <div className={styles.resultsection}>
                <div className={styles.resultsectiontitle}>Collections</div>
                <div className={styles.separator} />
                <div className={styles.resultlist}>
                  {collections.map((collection, idx) => (
                    <Link
                      key={idx}
                      to={`/explore`}
                      className={styles.result}
                      onClick={() => {
                        handleSelectCollection(collection.erc721Address);
                        setIsSearchShow(false);
                        resetResults();
                      }}
                    >
                      <img
                        className={styles.resultimg}
                        src={`${getRandomIPFS('', true)}${collection.logoImageHash
                          }`}
                      />
                      <div className={styles.resulttitle}>
                        {collection.collectionName}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {accounts.length > 0 && (
              <div className={styles.resultsection}>
                <div className={styles.resultsectiontitle}>Accounts</div>
                <div className={styles.separator} />
                <div className={styles.resultlist}>
                  {accounts.map((account, idx) => (
                    <Link
                      to={`/account/${account.address}`}
                      key={idx}
                      onClick={() => {
                        setIsSearchShow(false);
                        resetResults();
                      }}
                      className={styles.result}
                    >
                      {account.imageHash ? (
                        <img
                          className={styles.resultimg}
                          src={`${picassoGateway}${account.imageHash}`}
                        />
                      ) : (
                        <Identicon
                          className={styles.resultimg}
                          account={account.address}
                          size={40}
                        />
                      )}
                      <div className={styles.resulttitle}>{account.alias}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {tokens.length > 0 && (
              <div className={styles.resultsection}>
                <div className={styles.resultsectiontitle}>Items</div>
                <div className={styles.separator} />
                <div className={styles.resultlist}>
                  {tokens.map((tk, idx) => (
                    <Link
                      to={`/explore/${tk.contractAddress}/${tk.tokenID}`}
                      key={idx}
                      onClick={() => {
                        setIsSearchShow(false);
                        resetResults();
                      }}
                      className={styles.result}
                    >
                      <div className={styles.resultimg}>
                        {tokenDetailsLoading ? (
                          <Skeleton width={40} height={40} />
                        ) : (
                          tk.thumbnailPath &&
                          (tk.thumbnailPath.length > 10 ? (
                            <img
                              src={`${storageUrl}/image/${tk.thumbnailPath}`}
                            />
                          ) : tk.thumbnailPath === '-' ? (
                            <img src={tk.imageURL} />
                          ) : null)
                        )}
                      </div>
                      <div className={styles.resulttitle}>{tk.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {bundles.length > 0 && (
              <div className={styles.resultsection}>
                <div className={styles.resultsectiontitle}>Bundles</div>
                <div className={styles.separator} />
                <div className={styles.resultlist}>
                  {bundles.map((bundle, idx) => (
                    <Link
                      to={`/bundle/${bundle._id}`}
                      key={idx}
                      className={styles.result}
                    >
                      <div className={styles.resultimg}></div>
                      <div className={styles.resulttitle}>{bundle.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {keyword.length > 0 &&
              collections.length === 0 &&
              accounts.length === 0 &&
              tokens.length === 0 &&
              bundles.length === 0 && (
                <div className={styles.noResults}>No Results</div>
              )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    // <StickyBox offsetTop={80}>
    <div
      className={
        !stikyHeaderStatus ? styles.header_first : styles.header_second
      }


    >
      <div className={styles.left}>
        <Link to="/" className={styles.logo}>
          {/* <img src="/assets/images/logo/logo-2.png" alt="logo" /> */}
          Pi<span style={{ color: '#0a58ca' }}>ca</span>sso
        </Link>
        <div className='desktop-display-640'>
          {window.innerWidth >= 600 ? renderSearchBox() : ''}
        </div>
        <div className={styles.secondmenu}>
          <NavLink
            to="/index"
            className={cx(styles.menuLink, styles.link, styles.mobileView)}
            activeClassName={styles.active}
          >
            Home
          </NavLink>
          <NavLink
            to="/explore"
            className={cx(styles.menuLink, styles.link, styles.mobileView)}
            activeClassName={styles.active}
          >
            Explore
          </NavLink>
          <NavLink
            to="/activity"
            className={cx(styles.menuLink, styles.link, styles.mobileView)}
            activeClassName={styles.active}
          >
            Activity
          </NavLink>
          <NavLink
            to="/create"
            className={cx(styles.menuLink, styles.link, styles.mobileView)}
            activeClassName={styles.active}
          >
            Create
          </NavLink>
        </div>
      </div>

      <div className={styles.menu}>
        {/* {window.innerWidth >= 600 ? renderSearchBox() : ''} */}
        <div className='mobile-display-none-640'>
          <SearchIcon
            onClick={toggleMobileSearch}
            // className={cx(
            //   styles.searchicon,
            //   isSearchShow && styles.activeSearchIcon
            // ) + ' cu-po'}
            className={`${isSearchShow && styles.activeSearchIcon} mobile-display-none-640 cu-po`}
            style={{ fontSize: '25px' }}
          />
        </div>
        <NavLink
          to="/index"
          className={cx(styles.menuLink, styles.link)}
          activeClassName={styles.active}
          style={{ color: 'black' }}
        >
          Home
        </NavLink>
        <NavLink
          to="/explore"
          className={cx(styles.menuLink, styles.link)}
          activeClassName={styles.active}
          style={{ color: 'black' }}
        >
          Explore
        </NavLink>
        <NavLink
          to="/activity"
          className={cx(styles.menuLink, styles.link)}
          activeClassName={styles.active}
        >
          Activity
        </NavLink>
        <NavLink
          to="/create"
          className={cx(styles.menuLink, styles.link)}
          activeClassName={styles.active}
          style={{ color: 'black' }}
        >
          Create
        </NavLink>
        {account ? (
          <div
            className={cx(styles.account, styles.menuLink)}
            onClick={handleProfileMenuOpen}
          >
            {loading ? (
              // <Skeleton className={styles.avatar} />
              <i className={cx('icofont-user', styles.userIcon)} />
            ) : user?.imageHash ? (
              <img
                src={`${picassoGateway}${user?.imageHash}`}
                width="24"
                height="24"
                className={styles.avatar}
              />
            ) : (
              <Identicon
                account={account}
                size={36}
                className={styles.avatar}
              />
            )}
            <div className={styles.profile}>
              <div className={styles.address}>
                {loading ? (
                  <Skeleton width={120} />
                ) : (
                  user?.alias || shortenAddress(account)
                )}
              </div>
              {/* <div className={styles.network}>
                {loading ? <Skeleton width={80} /> : NETWORK_LABEL[chainId]}
              </div> */}
            </div>

            <MenuIcon
              style={{ fontSize: '30px' }}
              className={cx(styles.expand, isMenuOpen && styles.expanded)}
            />
          </div>
        ) : (
          <div
            className={cx(styles.connect, styles.menuLink)}
            onClick={handleConnectWallet}
          >
            <i
              className="icofont-wallet"
              style={{
                fontSize: '32px',
                color: 'darkblue',
                marginRight: '10px',
              }}
            />
            Connect
          </div>
        )}
      </div>
      {renderMenu}
      {isSearchShow &&
        <div className={styles.mobileSearch}>
          <div className='mt2 mb2 w10'>
            <div onClick={() => setIsSearchShow(false)} className={styles.searchCancelButton}>
              &times;
            </div>
          </div>
          <div className={styles.serarchButtonContainer}>
            <div className={'mauto w10'}>{renderSearchBox()}</div>
          </div>
        </div>
      }
      <WFTMModal
        visible={wftmModalVisible}
        onClose={() => dispatch(ModalActions.hideWFTMModal())}
      />
      <ModModal
        isAdding={isAdding}
        visible={modModalVisible}
        onClose={() => setModModalVisible(false)}
      />
      <BanCollectionModal
        visible={banCollectionModalVisible}
        isBan={isBan}
        onClose={() => setBanCollectionModalVisible(false)}
      />
      <BanItemModal
        visible={banItemModalVisible}
        onClose={() => setBanItemModalVisible(false)}
      />
      <BanUserModal
        visible={banUserModalVisible}
        onClose={() => setBanUserModalVisible(false)}
        isForBanning={true}
      />
      <BanUserModal
        visible={unbanUserModalVisible}
        onClose={() => setUnbanUserModalVisible(false)}
        isForBanning={false}
      />
      <BoostCollectionModal
        visible={boostCollectionModalVisible}
        onClose={() => setBoostCollectionModalVisible(false)}
      />
      <ConnectWalletModal
        visible={connectWalletModalVisible}
        onClose={() => dispatch(ModalActions.hideConnectWalletModal())}
      />
    </div>
    // </StickyBox>
    // </header>
  );
};

export default withRouter(Header);
