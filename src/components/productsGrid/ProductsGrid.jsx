import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "../productCard/ProductCard";
import "./ProductsGrid.scss";
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
  const secondRef = useRef(null);
  const { list, isLoading, hasMore } = products;

  const applyFilter = (category) => {
    setCategory(category);
    setProducts({
      list: [],
      isLoading: true,
      hasMore: false,
    });
    getProducts({ category });
  };

  const getProducts = async ({
    category,
    abortController,
    queryParams,
  } = {}) => {
    try {
      const url =
        category === "all"
          ? "https://dummyjson.com/products"
          : `https://dummyjson.com/products/category/${category}`;
      const res = await httpRequest({
        url,
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
    getProducts({
      category: "all",
      abortController,
    });
    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    console.log("ref in parent", lastProductRef);
    const element = secondRef.current;
    console.log(element);
    if (lastProductRef && lastProductRef.current && hasMore) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
      const element = secondRef.current;
      console.log(element);
      observer.observe(element);

      return () => {
        if (element) observer.unobserve(element);
      };
    }
  }, [hasMore, loadMore]);

  console.log("lastProductRef", lastProductRef);

  // const Item = forwardRef((props, ref) => {
  //   return (
  //     <div ref={props.lastProductRef.current} {...props}>
  //       {props.children}
  //     </div>
  //   );
  // });

  // Item.displayName = "Item";

  return (
    <>
      <ProductCategories applyFilter={applyFilter} />
      <VirtuosoGrid
        ref={secondRef}
        style={{ height: "100vh" }}
        // data={list}
        totalCount={list.length}
        // context={{ lastProductRef, lastIndex: list.length - 1 }}
        // components={{ Item }}
        listClassName="product-grid"
        itemContent={(index) => {
          console.log("len", list.length, index);
          const product = list[index];
          // secondRef.current = list.length === index + 1 ? lastProductRef : null;
          // return <ProductCard ref={lastProductRef} product={product} />;
          return (
            <ProductCard
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
