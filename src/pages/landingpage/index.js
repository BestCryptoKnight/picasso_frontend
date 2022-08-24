import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { useApi } from 'api';
import FAQ from '../../components/Faq/faq.json';
import { BsDash, BsPlus } from "react-icons/bs";

// import ChevronRightIcon from '@material-ui/icons/ChevronRight';
// import ReactPlayer from 'react-player';
import PopularCollectionItem from 'components/PopularCollectionItem';
import { Categories } from 'constants/filter.constants';
import HeaderActions from 'actions/header.actions';
import FilterActions from 'actions/filter.actions';
import CollectionsActions from 'actions/collections.actions';
import Header from 'components/header';
import Footer from 'components/Footer';
import NFTItem from 'components/NFTCard';
import icon1 from 'assets/imgs/Wallet.png';
import icon2 from 'assets/imgs/Category.png';
import icon3 from 'assets/imgs/Image2.png';
import icon4 from 'assets/imgs/Bookmark.png';
import search from 'assets/svgs/magnifier.svg';

import styles from './styles.module.scss';
import { pop } from 'jazzicon/colors';
import { shortenAddress, getExactImageUrl } from 'utils';

const cards = [
	{
		title: 'Set Up Your Wallet',
		description:
			'Wallet that is functional for NFT purchasing. You may have a Coinbase account at this point, but very few are actually set up to buy an NFT.',
		icon: icon1,
		colorbg: 'icon-color1',
	},
	{
		title: 'Create Your Collection',
		description:
			'Setting up your NFT collection and creating NFTs on NFTs is easy! This guide explains how to set up your first collection',
		icon: icon2,
		colorbg: 'icon-color2',
	},
	{
		title: 'Add Your NFTs',
		description:
			'Sed ut perspiciatis un de omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.',
		icon: icon3,
		colorbg: 'icon-color3',
	},
	{
		title: 'List Them For Sale',
		description:
			'Choose between auctions, fixed-price listings, and declining-price listings. You choose how you want to sell your NFTs!',
		icon: icon4,
		colorbg: 'icon-color4',
	},
];

const LandingPage = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const [popCollection, setPopCollection] = useState([]);
	const [tokenWithOwner, setTokenWithOwner] = useState([]);
	const { fetchAllTokens, fetchCollections, fetchAllAccounts } = useApi();
	let nftlist = [];
	const fetchInfo = async () => {
		dispatch(CollectionsActions.fetchStart());
		const p1 = fetchAllTokens();
		const p2 = fetchCollections();
		const p3 = fetchAllAccounts();
		const [tokens, collections, accounts] = await Promise.all([p1, p2, p3]);
		console.log(tokens.data)
		nftlist = tokens.data;
		let forCollection = [];
		let pickToken = [];
		if (collections.status === 'success') {
			const verified = [];
			const unverified = [];
			collections.data.map(item => {
				if (item.isVerified) verified.push(item);
				else unverified.push(item);
			});
			dispatch(CollectionsActions.fetchSuccess([...verified, ...unverified]));
		} else dispatch(CollectionsActions.fetchFailed());
		for (let i = 0; i < collections.data.length; i++) {
			let sum = 0;
			let img = [];
			let owner = collections.data[i].owner;
			tokens.data.map(token => {
				if (token.contractAddress === collections.data[i].address) {
					sum += Number(token.liked);
					img.push(token.imageURL);
				}
			});
			accounts.data.map(account => {
				if (account.address === collections.data[i].owner) {
					owner = account.alias || shortenAddress(account.address);
				}
			});
			forCollection.push({
				liked: sum,
				img,
				collectionName: collections.data[i].collectionName,
				collectionImg: collections.data[i].logoImageHash,
				owner,
			});
		}
		for (let j = 0; j < tokens.data.length; j++) {
			let owner = tokens.data[j].owner;
			accounts.data.map(account => {
				if (account.address === tokens.data[j].owner)
					owner = account.alias || account.address;
			});
			pickToken.push({ ...tokens.data[j], owner });
		}
		pickToken.sort((a, b) => {
			return b.liked - a.liked;
		});
		setTokenWithOwner(pickToken);
		setPopCollection(forCollection);
	};

	useEffect(() => {
		dispatch(HeaderActions.toggleSearchbar(true));
		// dispatch(FilterActions.updateCategoryFilter(null));
		fetchInfo();
	}, []);

	const handleViewCategory = id => {
		dispatch(FilterActions.updateCategoryFilter(id === 'all' ? null : id));
		history.push('/explore');
	};

	const renderAboutCard = (key, icon, title, desc, path) => (
		<div className={styles.aboutCard} key={key}>
			<NavLink to={path} className={styles.aboutCardLink}>
				<div className={styles.cardIconWrapper}>
					<img src={icon} />
				</div>
				<div className={styles.cardTitle}>{title}</div>
				<div className={styles.cardDesc}>{desc}</div>
			</NavLink>
		</div>
	);

	const renderCategoryCard = (key, icon, label, extra = false) => (
		<div
			className={styles.categoryCard}
			key={key}
			onClick={() => handleViewCategory(key)}
		>
			<div className={styles.cardIconWrapper2}>
				<img src={icon} />
			</div>
			<div className={cx(styles.cardLabelWrapper, extra && styles.extraCard)}>
				<div className={styles.cardLabel}>{label}</div>
				{/* <div className={styles.browseBtn}>
		  <ChevronRightIcon className={styles.browseBtnIcon} />
		</div> */}
			</div>
		</div>
	);
	const CreateItem = props => (
		<div className="col-sm-12 col-md-6 col-lg-3 col-xl-3">
			<div className="sc-box-icon">
				<div className="image">
					<div className={`icon-create ${props.item.colorbg}`}>
						<img src={props.item.icon} alt="" />
					</div>
				</div>
				<h3 className={styles.alignLeft}>{props.item.title}</h3>
				<p className={styles.alignLeft}>{props.item.description}</p>
			</div>
		</div>
	);

	// FAQ
	const [activeIndex, setActiveIndex] = useState(null);
	const faqOpen = index => {
		if (activeIndex === index) {
			setActiveIndex(null);
		} else {
			setActiveIndex(index);
		}
	};

	return (
		<div className={styles.container} >
			<Header />
			<section
				className={styles.bannerSection}
			// style={{ backgroundImage: "url('/assets/images/banner/01.gif')" }}
			>
				<div className='container pt7'>
					<div className='row'>
						<div className={styles.mobilePadding + ' col-sm-12 col-md-7'}>
							<h1 className='font-60 mo-font-30 primary-font'>
								<span className='orange-color font-60 mo-font-30 primary-font'> NFT </span> marketplace for
								ultimate <span className='orange-color font-60 mo-font-30 primary-font'>Pro</span> traders
							</h1>
							<p className=''>0.5% Fee · On-chain Orderbook · 100% Fee Sharing · Flexible royalties (0-10%)</p>
							<div className={styles.mobileCol + ' mb2 mt1 dis-f ai-c jc-s gap20 '}>
								<div>
									<Link to="/explore" className='btn btn-large btn-b2 td-n gap10'>
										<img style={{ maxWidth: '320px !important' }} className='icon' src="/assets/images/icons/star.svg" alt="" />
										<h2 className=''>All collectons</h2>
									</Link>
								</div>
								<div>
									<a href="https://twitter.com/picassoftm">
										<img
											src="/assets/images/footer/twitter.png"
											className={styles.socialIcon}
										/>
									</a>
									<a href="https://discord.com/invite/pumpkins">
										<img
											src="/assets/images/footer/discord.png"
											className={styles.socialIcon}
										/>
									</a>
								</div>
							</div>

							<div className={styles.totalValue}>
								<div className='dis-f fd-c gap10 pl2 pr2 '>
									<h4>Total Valume</h4>
									<div className='justify'>
										<img src="" alt="" />
										<span className='yellow-color font-20 bold'>
											35894.19
										</span>
									</div>
									<div className='grey-box'>
										≈ $56,844,191.04
									</div>
								</div>
								<div style={{ borderLeft: "1px solid grey" }} className='dis-f fd-c gap10 pl2 pr2'>
									<h4>Total Valume</h4>
									<div className='justify'>
										<img src="" alt="" />
										<span className='yellow-color font-20 bold'>
											35894.19
										</span>
									</div>
									<div className='grey-box'>
										≈ $56,844,191.04
									</div>
								</div>
							</div>
							{/* <div className={styles.btnGroup}>
				<div style={{ width: '15px' }}></div>
				<Link to="/create" className={styles.createButton}>
				  Create
				</Link>
			  </div> */}
						</div>
						<div className='col-sm-12 col-md-5 dis-f jc-e mo-jc-c'>
							<div className=''>
								{/* <img
				  src="/assets/images/banner/01.gif"
				  className={styles.backgroundImg}
				/> */}
								<div className={'mt2 mw-320i'}>
									{tokenWithOwner.slice(0, 1).map((item, key) => (
										<div key={`${key}`} className='btn-b1 dis-f fd-c' style={{ background: 'rgba(24,24,24,1' }}>
											<div className='p1 dis-f ai-c jc-s gap10'>
												<div className=''>
													<img className='icon w8' src="/assets/images/icons/star.svg" alt="" />
												</div>
												<div className=''>
													<p className=''>Trending</p>
												</div>
											</div>
											<div className=''>
												<img className='bt-b1' src={getExactImageUrl(item.imageURL)} alt="" />
											</div>
											<div className='p1'>
												<div className='justify-s'>
													<div className='dis-f ai-c jc-s gap10'>
														<p className=''>Created At</p>
														<p className=''>{item.createdAt.replace('T', ', ').slice(0, item.createdAt.length - 4)}</p>
													</div>
												</div>
												<div className='dis-f ai-c jc-s gap10'>
													<p className=''>Owner :</p>
													<p className=''>{shortenAddress(item.owner)}</p>
												</div>
												<div className='dis-f ai-c jc-s gap10'>
													<p className=''>Contact&nbsp;Address&nbsp;:</p>
													<p className=''>{shortenAddress(item.contractAddress)}</p>
												</div>
											</div>
											{console.log(item)}
										</div>
									))}

								</div>
							</div>
						</div>
					</div>

				</div>
				<div className={styles.body}>
					<div className={styles.main}>
						<div className={styles.mainLeft}>
							{/* <div className={styles.title}>
				<span style={{ color: 'darkblue' }}>Discover</span> Collect
				<br />
				And Sell <span style={{ color: 'darkblue' }}>NFT</span> Assets
			  </div>
			  <div className={styles.subtitle}>
				Digital Marketplace For Crypto Collectibles And Non-Fungible
				Tokens. Buy, Sell, And Discover Exclusive Digital Assets.
			  </div> */}

						</div>
					</div>
				</div>
			</section>
			{/* top nft list */}
			<section className='container'>
				<div className={styles.sectionWrapper}>
					<div className={styles.sectionHeaderContainer}>
						<div className={styles.sectionHeader}>
							<div className={styles.headLine}>🔥 Top collections by 1 Day Volume</div>

						</div>
						<div className={styles.aboutCards}>
							{/* tokenWithOwner */}
							{tokenWithOwner.slice(0, 12).map((item, index) => (
								<div key={`${index}`} className="mt1 mb1 w10 dis-f ai-c jc-s gap10" >
									<div className=''>
										<h3 style={{ width: '20px' }}>
											{index}
										</h3>
									</div>
									<div className=''>
										<img className='br-50' style={{ minWidth: '50px', minHeight: '50px', maxWidth: '50px', maxHeight: '50px' }} src={getExactImageUrl(item.imageURL)} alt="" />
									</div>
									<div className='dis-f fd-c jc-sb'>
										<h2>{item.name}</h2>
										<h4 className='grey-color'>Address : {shortenAddress(item.contractAddress)}</h4>
									</div>
								</div>
							))}
						</div>
						<div className={styles.more}>
							<Link to="/explore">EXPLORE MORE</Link>
						</div>
					</div>
				</div>
			</section>

			{/* <section className='container'>
		<div className={styles.sectionWrapper}>
		  <div className={styles.sectionHeaderContainer}>
			<div className={styles.sectionHeader}>
			  <div className={styles.headLine}>Popular Collection</div>
			  <div className={styles.more}>
				<Link to="/explore">EXPLORE MORE</Link>
			  </div>
			</div>
			<div className={styles.aboutCards}>
			  {popCollection
				.sort((a, b) => b.liked - a.liked)
				.slice(0, 3)
				.map((item, index) => {
				  return <PopularCollectionItem key={index} item={item} />;
				})}
			</div>
		  </div>
		</div>
	  </section> */}

			{/* smart collector */}
			<section className='container'>
				<div style={{ maxWidth: '480px' }}>
					<h1 className='font-30'>
						Everything you need <br />
						to become a <span className='orange-color'>smart</span> collector
					</h1>
					<div className='mt3'></div>
					<h4 className='grey-color'>
						Fastest rarity ranking reveals, clean and slick interface and 0.5% fee because we believe the user deserves more.
					</h4>
				</div>
				<div className='mt6'>
					<div className={styles.smartCollectorContainer}>
						<div className={'row-span-3 ' + styles.smartCollectorBox}>
							<div className='w10'>
								<h3>🤑</h3>
								<h3 className=''>Lowest gas + Trading fees (0.5%)</h3>
								<p className='grey-color'>Find & flip NFTs while paying the lowest gas and a flat 0.5% trading fee.</p>
							</div>
							<div className='w10'>
								<h3>👽</h3>
								<h3 className=''>EIP-712 signing</h3>
								<p className='grey-color'>Know what you&apos;re really signing.</p>
							</div>
							<div className='w10'>
								<h3>💎</h3>
								<h3 className=''>Multisource Liquidity</h3>
								<p className='grey-color'>Liquidity from multiple sources in one place</p>
							</div>
						</div>
						<div className={'row-span-2 ' + styles.smartCollectorBox}>

							<div className=''>
								<h3 className=''>Powerful filters</h3>
								<p className='grey-color'>Use our wide array of filters to comb through the NFT library with as much granularity as you want.</p>
							</div>
							<div className='mt1 mb1 dis-f ai-c jc-s tl w10'>
								<div className='cu-po dis-f ai-c jc-s gap5'>
									<p className=''>Learn More</p>
									<div className='br-50 white-bg justify'>
										<i className="icofont-arrow-right black-color" style={{ fontSize: '14px', marginTop: '1px' }}></i>
									</div>
								</div>
							</div>
							<div className=''>
								<img className='' src="/assets/images/smart-collector/filters.svg" alt="" />
							</div>
						</div>
						<div className={'row-span-3 ' + styles.smartCollectorBox}>
							<div className=''>
								<h3>Trait Analysis</h3>
								<p className='grey-color'>Get even more granular data about a trait in a collection viz. floor price, number of sales, rarity, volume & percent listed.</p>
							</div>
							<div className='mt1 mb1 dis-f ai-c jc-s tl w10'>
								<div className='cu-po dis-f ai-c jc-s gap5'>
									<p className=''>Learn More</p>
									<div className='br-50 white-bg justify'>
										<i className="icofont-arrow-right black-color" style={{ fontSize: '14px', marginTop: '1px' }}></i>
									</div>
								</div>
							</div>
							<div className=''>
								<img className='' src="/assets/images/smart-collector/trait.svg" alt="" />
							</div>
						</div>

						<div className={'row-span-4 ' + styles.smartCollectorBox}>
							<div className=''>
								<h3>In Depth analytics</h3>
								<p className='grey-color'>Check who is HODL-ing the most</p>
							</div>
							<div className='mt1 mb1 dis-f ai-c jc-s tl w10'>
								<div className='cu-po dis-f ai-c jc-s gap5'>
									<p className=''>Learn More</p>
									<div className='br-50 white-bg justify'>
										<i className="icofont-arrow-right black-color" style={{ fontSize: '14px', marginTop: '1px' }}></i>
									</div>
								</div>
							</div>
							<div className=''>
								<img className='' src="/assets/images/smart-collector/graph2.png" alt="" />
							</div>
							<p className='grey-color'>
								Get in-depth analytics about a collection - volume, price and sales chart, floor distribution, top minters and holder activity.
							</p>
							<div className=''>
								<img className='' src="/assets/images/smart-collector/graph.svg" alt="" />
							</div>
						</div>

						<div className={'row-span-3 ' + styles.smartCollectorBox}>
							<div className=''>
								<h3>Portfolio Tracker</h3>
								<p className='grey-color'>Keep track of the items in your portfolio and estimate the value of your current holdings and realized gains.</p>
							</div>
							<div className='mt1 mb1 dis-f ai-c jc-s tl w10'>
								<div className='cu-po dis-f ai-c jc-s gap5'>
									<p className=''>Learn More</p>
									<div className='br-50 white-bg justify'>
										<i className="icofont-arrow-right black-color" style={{ fontSize: '14px', marginTop: '1px' }}></i>
									</div>
								</div>
							</div>
							<div className=''>
								<img className='' src="/assets/images/smart-collector/Tracker.svg" alt="" />
							</div>
						</div>

						<div className={'row-span-3 ' + styles.smartCollectorBox}>
							<div className=''>
								<h3>List anywhere</h3>
								<p className='grey-color'>Golom allows you to list NFTs on the platform of your choice.</p>
							</div>
							<div className='mt1 mb1 dis-f ai-c jc-s tl w10'>
								<div className='cu-po dis-f ai-c jc-s gap5'>
									<p className=''>Learn More</p>
									<div className='br-50 white-bg justify'>
										<i className="icofont-arrow-right black-color" style={{ fontSize: '14px', marginTop: '1px' }}></i>
									</div>
								</div>
							</div>
							<div className=''>
								<img className='' src="/assets/images/smart-collector/anywhere.svg" alt="" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<div className='p6'></div>
			<section className='container'>
				<div className='' style={{ maxWidth: '480px' }}>
					<h1 className='font-30'>
						Frequently Asked Questions
					</h1>
					<div className='mt3'></div>
					<h4 className='grey-color'>
						Have a specific question in mind?
					</h4>
					<h4 className='grey-color'>
						Drop us a mail at hello@golom.io and we would get back to you.
					</h4>
				</div>
				<div className='faqs'>
					{FAQ.map((item, index) => (
						<div key={`${index}`} className='p1 faq-section'>
							<div className='faq-container'>
								<div onClick={() => (faqOpen(index))} className='faq-title'>
									<div className='dis-f jc-s'>
										<span className='font-15'>
											{item.icon}
										</span>
										<div className='ml2'>
											{item.title}
										</div>
									</div>
									<div className=''>
										<div className='faq-icon-container'>
											{
												activeIndex === index ?
													<BsDash fill='#ff8982' fontSize={'17px'} />
													:
													<BsPlus fill='#ff8982' fontSize={'17px'} />
											}
										</div>

									</div>
								</div>
								<div className={`faq-body ${activeIndex === index ? 'faq-body-visable' : ''}`}>
									{item.content}
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className='container'>
				<div className={styles.sectionWrapper}>
					<div className={styles.sectionHeaderContainer}>
						<div className={styles.sectionHeader}>
							<div className={styles.headLine}>Create And Sell Your NFTs</div>
						</div>
						<div className={styles.aboutCards2}>
							<div className='row'>
								{cards.map((item, key) => (
									<CreateItem key={`${key}`} item={item} />
								))}
							</div>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default LandingPage;
