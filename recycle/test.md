mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    userErrors {
      field
      message
    }
  }
}

{
  "productId": "gid://shopify/Product/10145067761974",
  "variants": [
    { 
       "inventoryQuantities": {
        "locationId": "gid://shopify/Location/104149254454",
        "availableQuantity": 12
      },
      "price": 15.99,
      "compareAtPrice": 19.99,
      "optionValues":{
        "optionId": "gid://shopify/ProductOption/12738614886710",
        "name": "Title"
      }
    }
  ]
}

const { admin } = await authenticate.admin(request);

const response = await admin.graphql(
  `#graphql
  mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      productVariants {
        id
        title
        selectedOptions {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
  {
    variables: {
      "productId": "gid://shopify/Product/20995642",
      "variants": [
        {
          "price": 15.99,
          "compareAtPrice": 19.99,
          "optionValues": [
            {
              "name": "Golden",
              "optionId": "gid://shopify/ProductOption/328272167"
            }
          ]
        }
      ]
    },
  },
);

const data = await response.json();
