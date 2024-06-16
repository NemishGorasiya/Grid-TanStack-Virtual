import "./ProductCard.scss";

const ProductCard = ({ index, rowIndex, columnIndex, product }) => {
	const { title, thumbnail } = product || {};
	return (
		<div className="product-card">
			<div className="product-card-image-wrapper">
				<img
					className="product-card-image"
					src={thumbnail}
					alt="product card"
				/>
			</div>
			<div className="product-details-wrapper">
				<div className="product-detail">
					row{index} {rowIndex}
				</div>
				<div className="product-detail">column {columnIndex}</div>
				<div className="product-detail">{title}</div>
				<div className="product-detail">{title}</div>
			</div>
		</div>
	);
};

export default ProductCard;
