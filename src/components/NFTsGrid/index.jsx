import React, { useState, useEffect } from 'react';
import cx from 'classnames';

import Card from '../NFTCard';

import styles from './styles.module.scss';
import { Categories } from '../../constants/filter.constants';
import { useDispatch } from 'react-redux';
import FilterActions from '../../actions/filter.actions';

const NFTsGrid = ({
  items,
  numPerRow,
  uploading,
  loading,
  showCreate,
  category,
  onCreate = () => { },
  onLike = () => { },
}) => {
  const [n, setN] = useState(4);
  const [smallItemNum, setSmallItemNum] = useState(false);
  useEffect(() => {
    if (window.innerWidth >= 2348) setN(5);
    else if (window.innerWidth >= 1900) setN(4);
    else if (window.innerWidth >= 1400) setN(3);
    else if (window.innerWidth >= 935) setN(2);
    else setN(1);
  }, []);
  useEffect(() => {
    if (
      (window.innerWidth >= 2348 && items.length < 5) ||
      (window.innerWidth >= 1900 && items.length < 4) ||
      (window.innerWidth >= 1400 && items.length < 3) ||
      (window.innerWidth >= 935 && items.length < 2)
    ) {
      setSmallItemNum(true);
    } else {
      setSmallItemNum(false);
    }
  }, [items]);
  const dispatch = useDispatch();
  // const n = numPerRow || 6;
  const className = cx(styles.nft, styles[`num${n}`]);
  return (
    <div
      className={"p1 " + cx(
        styles.nft,
        smallItemNum ? styles.smallNumCont : '',
        loading ? styles.skeletonWrapper : ''
      )}
    >
      {showCreate && (
        <div className={className}>
          <Card create onCreate={onCreate} />
        </div>
      )}
      {uploading &&
        new Array(n * 2).fill(0).map((_, idx) => (
          <div className={className} key={idx}>
            <Card loading />
          </div>
        ))}
      {(items || []).map(item => (
        <div
          className={className}
          key={
            item.items ? item._id : `${item.contractAddress}-${item.tokenID}`
          }
        >
          <Card item={item} onLike={onLike} />
        </div>
      ))}
      {/* {loading &&
        new Array(n * 2).fill(0).map((_, idx) => (
          <div className={className} key={idx}>
            <Card loading />
          </div>
        ))} */}
      {/* {!items.length && category !== null && category !== undefined && (
        <>
          <div style={{ display: 'flex', paddingLeft: '10px' }}>
            No results found for the {Categories[category].label} category.
          </div>
          <div
            onClick={() => dispatch(FilterActions.updateCategoryFilter(null))}
            className={styles.link}
          >
            Select all categories
          </div>
        </>
      )} */}
    </div>
  );
};

export default NFTsGrid;
