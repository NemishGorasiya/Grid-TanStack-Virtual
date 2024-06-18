import { forwardRef, useEffect } from "react";
import "./ProductCard.scss";

const ProductCard = forwardRef(({ product, hasMore, loadMore }, ref) => {
  useEffect(() => {
    if (ref && ref.current && loadMore && hasMore) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
      const element = ref.current;
      observer.observe(element);

      return () => {
        if (element) observer.unobserve(element);
      };
    }
  }, [hasMore, loadMore, ref]);

  const { title, thumbnail } = product || {};
  return (
    <div ref={ref} className="product-card">
      <div className="product-card-image-wrapper">
        <img
          className="product-card-image"
          src={thumbnail}
          alt="product card"
        />
      </div>
      <div className="product-details-wrapper">
        <div className="product-detail">{title}</div>
        <div className="product-detail">{title}</div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
