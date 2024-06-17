import { productCategories } from "../../utils/constants";
import "./ProductCategories.scss";

const ProductCategories = ({ applyFilter }) => {
  return (
    <div className="product-category-wrapper">
      {productCategories.map((productCategory) => {
        const { name, slug } = productCategory || {};

        return (
          <button
            onClick={() => applyFilter(slug)}
            key={slug}
            className="product-category-filter-button"
          >
            {name}
          </button>
        );
      })}
    </div>
  );
};

export default ProductCategories;
