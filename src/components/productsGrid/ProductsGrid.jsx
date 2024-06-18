import { useEffect, useState } from "react";
import ProductCard from "../productCard/ProductCard";
import "./ProductsGrid.css";
import { httpRequest } from "../../services/services";
import { VirtuosoGrid } from "react-virtuoso";

const ProductsGrid = () => {
	const [products, setProducts] = useState({
		list: [],
		isLoading: true,
		hasMore: false,
	});
	const { list, isLoading, hasMore } = products;
	const getProducts = async ({ abortController, queryParams } = {}) => {
		try {
			const res = await httpRequest({
				url: "https://dummyjson.com/products",
				queryParams: {
					limit: 10,
					...queryParams,
				},
				abortController,
			});
			if (res) {
				const { products, total } = res;
				setProducts((prevProducts) => {
					const newList = [...prevProducts.list, ...products];
					const hasMore = newList.length < total;
					return { list: newList, isLoading: false, hasMore };
				});
			}
		} catch (error) {
			setProducts((prevProducts) => {
				return { ...prevProducts, isLoading: false };
			});
			console.error(error);
		}
	};

	const loadMore = () => {
		if (!isLoading && hasMore) {
			setProducts((prevProducts) => {
				return { ...prevProducts, isLoading: true };
			});
			getProducts({ queryParams: { skip: list.length } });
		}
	};

	const handleLoadMore = () => {
		const containerHeight = document.documentElement.clientHeight;
		const contentHeight =
			document.querySelector(".product-grid")?.scrollHeight || 0;

		if (contentHeight < containerHeight) {
			loadMore();
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
		<VirtuosoGrid
			style={{ height: "100vh" }}
			data={list}
			endReached={loadMore}
			rangeChanged={handleLoadMore}
			listClassName="product-grid"
			itemContent={(_, product) => <ProductCard product={product} />}
		/>
	);
};

export default ProductsGrid;
