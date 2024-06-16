import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ProductCard from "../productCard/ProductCard";
import "./ProductsGrid.css";
import useGridColumns from "../../hooks/useGridColumns";
import { httpRequest } from "../../services/services";

const ProductsGrid = () => {
	const [products, setProducts] = useState({
		list: [],
	});
	const { list } = products;
	const parentRef = useRef(null);
	const columns = useGridColumns();
	// const columns = 5; // Number of columns in the grid
	const itemHeight = 285; // Height of each row
	const totalItems = 200; // Total number of items
	const rowCount = Math.ceil(totalItems / columns); // Total number of rows

	const virtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => itemHeight,
		overscan: 2,
	});

	const getColumnWidth = () => {
		if (parentRef.current) {
			return parentRef.current.clientWidth / columns;
		}
		return 200; // Default width if not available
	};

	const getProducts = async ({ abortController }) => {
		try {
			const res = await httpRequest({
				url: "https://dummyjson.com/products",
				queryParams: {
					limit: 10,
				},
				abortController,
			});
			if (res) {
				const { products } = res;
				setProducts({ list: products });
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		const abortController = new AbortController();
		getProducts({
			abortController,
		});
		return () => {
			abortController.abort();
		};
	}, []);

	return (
		<div
			ref={parentRef}
			style={{
				width: "100%",
				height: "100vh",
				overflowY: "auto", // Only vertical scrolling
				overflowX: "hidden", // Prevent horizontal scrolling
				position: "relative",
			}}
		>
			<div
				style={{
					height: `${rowCount * itemHeight}px`, // Total height of all rows
					position: "relative",
				}}
			>
				{virtualizer.getVirtualItems().map((virtualRow) => (
					<div
						key={virtualRow.key}
						style={{
							position: "absolute",
							top: `${virtualRow.start}px`,
							width: "100%",
							height: `${itemHeight}px`,
							display: "flex",
						}}
					>
						{Array.from({ length: columns }, (_, columnIndex) => {
							const itemIndex = virtualRow.index * columns + columnIndex;
							if (itemIndex >= totalItems) return null;

							const width = getColumnWidth();
							return (
								<div
									key={itemIndex}
									style={{
										// flex: `1 0 ${width}px`,
										width: `${width}px`,
										flexBasis: `${width}px`,
										flexGrow: 1,
										height: "100%",
										border: "1px solid #c8c8c8",
									}}
								>
									<ProductCard
										index={itemIndex}
										rowIndex={virtualRow.index}
										columnIndex={columnIndex}
										product={list[itemIndex]}
									/>
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};

export default ProductsGrid;
