import { useCallback, useRef } from "react";
import PropTypes from "prop-types";

const InfiniteScroll = ({ items, renderItem, fetchMoreData, isLoading }) => {
  const observer = useRef();

  const lastUserRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreData();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchMoreData, isLoading]
  );

  return (
    <>
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={items.length === index + 1 ? lastUserRef : null}
        >
          {renderItem({
            ...item,
          })}
        </div>
      ))}
    </>
  );
};

InfiniteScroll.propTypes = {
  items: PropTypes.array,
  renderItem: PropTypes.func,
  fetchMoreData: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default InfiniteScroll;
