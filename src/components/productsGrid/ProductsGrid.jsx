import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ProductCard from "../productCard/ProductCard";
import "./ProductsGrid.scss";
import useGridColumns from "../../hooks/useGridColumns";
import { httpRequest } from "../../services/services";
import ProductCategories from "../productsCategories/ProductCategories";

const ProductsGrid = () => {
  const [products, setProducts] = useState({
    list: [],
    isLoading: true,
    hasMore: false,
  });
  const [category, setCategory] = useState("all");

  // To abort ongoing requests which are not required any more
  const currentAbortController = useRef(null);

  const { list, isLoading, hasMore } = products;

  const getProducts = useCallback(
    async ({ abortController, queryParams, category } = {}) => {
      console.log("category", category);
      try {
        const url =
          category === "all"
            ? "https://dummyjson.com/products"
            : `https://dummyjson.com/products/category/${category}`;

        const res = await httpRequest({
          url,
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
        console.error(error);
      }
    },
    []
  );

  const applyFilter = (category) => {
    // abort currently ongoing requests
    if (currentAbortController.current) {
      currentAbortController.current.abort();
    }

    // create and assign new abort controller to upcoming requests
    currentAbortController.current = new AbortController();

    setProducts((prevProducts) => ({
      ...prevProducts,
      list: [],
      isLoading: true,
      hasMore: false,
    }));
    setCategory(category);

    getProducts({ category, abortController: currentAbortController.current });
  };

  // load more products
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      if (currentAbortController.current) {
        currentAbortController.current.abort();
      }
      currentAbortController.current = new AbortController();
      setProducts((prevProducts) => ({
        ...prevProducts,
        isLoading: true,
      }));
      getProducts({
        category,
        queryParams: { skip: list.length },
        abortController: currentAbortController.current,
      });
    }
  }, [category, getProducts, hasMore, isLoading, list.length]);

  // initial request
  useEffect(() => {
    const abortController = new AbortController();
    getProducts({
      category: "all",
      abortController,
    });
    return () => {
      abortController.abort();
    };
  }, [getProducts]);

  return (
    <>
      <ProductCategories applyFilter={applyFilter} />
    </>
  );
};

export default ProductsGrid;
