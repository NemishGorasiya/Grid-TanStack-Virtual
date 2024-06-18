import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "../productCard/ProductCard";
import "./ProductsGrid.css";
import { httpRequest } from "../../services/services";
import { VirtuosoGrid } from "react-virtuoso";
import ProductCategories from "../productsCategories/ProductCategories";

const ProductsGrid = () => {
  const [products, setProducts] = useState({
    list: [],
    isLoading: true,
    hasMore: false,
  });
  const [category, setCategory] = useState("all");
  const lastProductRef = useRef(null);
  const currentAbortController = useRef(null);
  const { list, isLoading, hasMore } = products;

  const applyFilter = () => {};

  const getProducts = async ({ abortController, queryParams } = {}) => {
    try {
      const res = await httpRequest({
        url: "https://dummyjson.com/products",
        queryParams: {
          limit: 3,
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

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setProducts((prevProducts) => {
        return { ...prevProducts, isLoading: true };
      });
      getProducts({ queryParams: { skip: list.length } });
    }
  }, [hasMore, isLoading, list.length]);

  useEffect(() => {
    const abortController = new AbortController();
    currentAbortController.current = abortController;
    getProducts({
      abortController: currentAbortController,
    });
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <>
      <ProductCategories applyFilter={applyFilter} />
      <VirtuosoGrid
        style={{ height: "100vh" }}
        totalCount={list.length}
        listClassName="product-grid"
        itemContent={(index) => {
          const product = list[index];
          return (
            <ProductCard
              isLoading={isLoading}
              hasMore={hasMore}
              loadMore={loadMore}
              ref={list.length === index + 1 ? lastProductRef : null}
              product={product}
            />
          );
        }}
      />
    </>
  );
};

export default ProductsGrid;
