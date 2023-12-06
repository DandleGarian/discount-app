// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

// Use JSDoc annotations for type safety
/**
* @typedef {import("../generated/api").RunInput} RunInput
* @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
* @typedef {import("../generated/api").Target} Target
* @typedef {import("../generated/api").ProductVariant} ProductVariant
*/

/**
* @type {FunctionRunResult}
*/
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.All,
  discounts: [],
};

let targets = [];

// Helper function to calculate discount
function calculateDiscount(customerTags) {
  const discountMap = {
    'VIP': 80,
    'Top 100': 50,
    'Top 100,VIP': 5
  };

  const key = customerTags.sort().join(',');
  return discountMap[key] || 0;
}

// The configured entrypoint for the 'purchase.product-discount.run' extension target
/**
* @param {RunInput} input
* @returns {FunctionRunResult}
*/

export function run(input) {
  if (input.cart.buyerIdentity?.customer?.hasAnyTag) {
    const discounts = input.cart.lines
      .filter(line => line.merchandise.__typename == "ProductVariant")
      .map(line => {
        const variant = /** @type {ProductVariant} */ (line.merchandise);
        const customerTags = input.cart.buyerIdentity?.customer?.hasTags
          .filter(tagObject => tagObject.hasTag)
          .map(tagObject => tagObject.tag);

        // Calculate discount
        const discountPercentage = calculateDiscount(customerTags);

        return {
          targets: [
            {
              productVariant: {
                id: variant.id
              }
            }
          ],
          value: {
            percentage: {
              value: discountPercentage
            }
          }
        };
      });

    return {
      discounts,
      discountApplicationStrategy: DiscountApplicationStrategy.All
    };
  } else {
    console.error("No discount for you");
    return EMPTY_DISCOUNT;
  }
}
