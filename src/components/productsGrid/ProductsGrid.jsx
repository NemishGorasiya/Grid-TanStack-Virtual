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

  const parentRef = useRef(null);

  // To abort ongoing requests which are not required any more
  const currentAbortController = useRef(null);

  // column count calculating dynamically using match-media
  const columns = useGridColumns();

  const { list, isLoading, hasMore } = products;

  // Height of each row
  const itemHeight = 285;

  const rowCount = Math.ceil(list.length / columns);

  const virtualizer = useVirtualizer({
    count: hasMore ? rowCount + 1 : rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 2,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // calculate column width
  const getColumnWidth = () => {
    if (parentRef.current) {
      return parentRef.current.clientWidth / columns;
    }
    return 200;
  };

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

  // infinite scrolling
  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();
    if (!lastItem) {
      return;
    }
    if (lastItem.index >= rowCount - 1 && hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore, rowCount, virtualItems]);

  return (
    <>
      <ProductCategories applyFilter={applyFilter} />
      <div ref={parentRef} className="product-grid-container">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`, // Total height of all rows
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              className="product-grid-row"
              style={{
                top: `${virtualRow.start}px`,
                height: `${itemHeight}px`,
              }}
            >
              {Array.from({ length: columns }, (_, columnIndex) => {
                const itemIndex = virtualRow.index * columns + columnIndex;
                if (itemIndex >= list.length) return null;

                const width = getColumnWidth();
                return (
                  <div
                    key={itemIndex}
                    style={{
                      // flex: `1 0 ${width}px`,
                      // maxWidth: `${width}px`,
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
    </>
  );
};

export default ProductsGrid;
