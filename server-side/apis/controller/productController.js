const {
  getCatgData,
  postCatgData,
  getSubCatgData,
  pushNewCatg,
} = require("../modal/categoryModal");
const {
  postProductData,
  getProductData,
  getProduct,
} = require("../modal/productModal");

const postProductController = async (req, res) => {
  if (req.fileValidationError) {
    return res.send(req.fileValidationError);
  }

  let productAlreadyExist = [];
  let successfullEntries = [];

  // const data = req.json?.map((obj) => {
  //   const temp = obj["Category: Subcategory"].split(";").map((val) => {
  //     return val.trim().split(":");
  //   });
  //   const catgs = temp?.map((val) => {
  //     const temp2 = val[1].trim();
  //     const temp3 = temp2
  //       .substring(1, temp2.length - 1)
  //       .split(",")
  //       .map((subcatg) => subcatg.trim());

  //     return {
  //       category: val[0],
  //       subCategory: temp3,
  //     };
  //   });
  //   return {
  //     product: obj.Product,
  //     productDesc: obj.Description,
  //     category: catgs,
  //   };
  // });
  //   result = await postData(data);

  // const temp = [
  //   {
  //     productName: "product1",
  //     productDesc: "product1 description",
  //     category: [
  //       {
  //         category: { catgId: 1, catgName: "Category1" },
  //         subCategory: [
  //           { subCatgId: 1, subCatgName: "Subcategory1" },
  //           { subCatgId: 2, subCatgName: "Subcategory2" },
  //         ],
  //       },
  //       {
  //         category: { catgId: 2, catgName: "Category2" },
  //         subCategory: [
  //           { subCatgId: 1, subCatgName: "Subcategory1" },
  //           { subCatgId: 2, subCatgName: "Subcategory2" },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     productName: "product2",
  //     productDesc: "product2 description",
  //     category: [
  //       {
  //         category: { catgId: 1, catgName: "Category1" },
  //         subCategory: [
  //           { subCatgId: 1, subCatgName: "Subcategory1" },
  //           { subCatgId: 2, subCatgName: "Subcategory2" },
  //         ],
  //       },
  //       {
  //         category: { catgId: 2, catgName: "Category2" },
  //         subCategory: [
  //           { subCatgId: 1, subCatgName: "Subcategory1" },
  //           { subCatgId: 2, subCatgName: "Subcategory2" },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     productName: "product3",
  //     productDesc: "product3 description",
  //     category: [
  //       {
  //         category: { catgId: 1, catgName: "Category1" },
  //         subCategory: [
  //           { subCatgId: 1, subCatgName: "Subcategory1" },
  //           { subCatgId: 2, subCatgName: "Subcategory2" },
  //         ],
  //       },
  //       {
  //         category: { catgId: 2, catgName: "Category2" },
  //         subCategory: [
  //           { subCatgId: 1, subCatgName: "Subcategory1" },
  //           { subCatgId: 2, subCatgName: "Subcategory2" },
  //         ],
  //       },
  //       {
  //         category: { catgId: 2, catgName: "Category2" },
  //         subCategory: [
  //           { subCatgId: 1, subCatgName: "Subcategory1" },
  //           { subCatgId: 2, subCatgName: "Subcategory2" },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     productName: "product4",
  //     productDesc: "product4 description",
  //     category: [
  //       {
  //         category: { catgId: 1, catgName: "Category1" },
  //         subCategory: [
  //           { subCatgId: 1, subCatgName: "Subcategory1" },
  //           { subCatgId: 2, subCatgName: "Subcategory2" },
  //         ],
  //       },
  //     ],
  //   },
  // ];
  // const result = await postProductData(temp);

  req.json?.forEach(async (value, index) => {
    const isProductAvailable = await getProductData(value.Product);

    if (!isProductAvailable?.data?.length) {
      const isCatgAvailable = await getCatgData(value.Category);

      let catgId = null;
      let subCatgId = null;

      if (isCatgAvailable?.data) {
        catgId = isCatgAvailable.data._id;

        const isSubCatgAvailable = await getSubCatgData(value["Sub-category"]);

        if (isSubCatgAvailable.data) {
          const subCatgDetail = isSubCatgAvailable.data.subCategory.filter(
            (subCatg) => subCatg.name === value["Sub-category"]
          );
          subCatgId = subCatgDetail?.[0]?._id;
        } else {
          const subCatgRes = await pushNewCatg(catgId, value["Sub-category"]);
          subCatgId = subCatgRes.data.subCategory[0]._id;
        }
      } else {
        const catgObj = {
          category: value.Category,
          subCategory: [{ name: value["Sub-category"] }],
        };
        value["Sub-category"];

        const postCatgResult = await postCatgData(catgObj);

        console.log("postCatgResult: ", postCatgResult);

        catgId = postCatgResult.data._id;

        subCatgId = postCatgResult.data.subCategory[0]._id;
      }
      console.log("catgId: ", catgId, "subCatgId: ", subCatgId);

      // const finalProduct = {
      //   productName: value.Product,
      //   category: [
      //     {
      //       category: { catgId, catgName: value.Category },
      //       subCategory: [{ subCatgId, subCatgName: value["Sub-category"] }],
      //     },
      //   ],
      // };

      const finalProduct = {
        "Product Name": value.Product,
        "Category Id": catgId,
        "Sub-category Id": subCatgId,
      };
      const postProduct = await postProductData(finalProduct);
      catgId = null;
      subCatgId = null;
      successfullEntries.push(postProduct.data);
    } else {
      productAlreadyExist.push(isProductAvailable.data[0]);
    }
  });
  console.log("successfullEntries:  ", successfullEntries);
  console.log("isProductAvailable.data:  ", productAlreadyExist);
  res.send({ successfullEntries, productAlreadyExist });
};

const getProductController = async (req, res) => {
  const result = await getProduct();
  res.send(result);
};

module.exports = { postProductController, getProductController };
