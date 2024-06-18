import { forwardRef, useEffect, useRef } from "react";
import "./ProductCard.scss";

const ProductCard = forwardRef(({ product }, ref) => {
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
