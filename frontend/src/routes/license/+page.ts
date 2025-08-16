import type {PageLoad} from './$types';

export interface ProductDto {
    code: string,
    salesCode: string,
    name: string,
    description: string,
    forSale: boolean
    productFamilyName: string
    releases: Array<{ version: string }>
}

export interface Product {
    code: string,
    name: string,
    productFamilyName: string
    version: string
}

export interface PluginDto {
    ID: number,
    Link: string,
    Name: string,
    Preview: string,
    Downloads: number,
    PricingModel: string,
    Icon: string,
    PreviewImage: string,
    Rating: number,
    HasSource: boolean,
    Tags: Array<string>,
}

export interface PurchaseInfo {
    ProductCode: string,
    BuyURL: any,
    PurchaseTerms: any,
    Optional: boolean,
    TrialPeriod: number,
}

export interface PluginDetail {
    ID: number,
    Name: string,
    Link: string,
    Approve: boolean,
    Description: string,
    CustomIdeList: boolean,
    Preview: string,
    Family: string,
    Downloads: number,
    PurchaseInfo: PurchaseInfo,
    PricingModel: string,
    Icon: string,
    IsHidden: boolean,
    IsMonetizationAvailable: boolean,
    IsBlocked: boolean,
    IsModificationAllowed: boolean,
}

const DataBaseUrl = "https://data.services.jetbrains.com"
const PluginBaseUrl = "https://plugins.jetbrains.com"

export const load: PageLoad = async ({fetch}) => {
    let [res1, res2] = await Promise.all([GetProductCode(fetch), GetPluginCode(fetch)]);
    return {
        products: Array.of(...res1, ...res2)
    }
};

async function GetProductCode(fetch: { (input: RequestInfo): Promise<Response> }) {
    let resp = await fetch(`${DataBaseUrl}/products?fields=name,code,forSale,salesCode,description,productFamilyName,releases.version`)
    let productDtos: Array<ProductDto> = await resp.json()
    let products: Array<Product> = [];
    productDtos.forEach(dto => {
        dto.productFamilyName = dto.productFamilyName.replace(" ", "-").toLowerCase()
        let extra = dto.forSale && (dto.salesCode != dto.code);
        products.push(
            {
                code: dto.code,
                name: extra ? `${dto.name}(${dto.code})` : dto.name,
                productFamilyName: dto.productFamilyName,
                version: dto.releases.length > 0 ? dto.releases[0].version : ""
            }
        );
        if (extra) {
            products.push(
                {
                    code: dto.salesCode,
                    name: `${dto.name}(${dto.salesCode})`,
                    productFamilyName: dto.productFamilyName,
                    version: dto.releases.length > 0 ? dto.releases[0].version : ""
                }
            );
        }
    });
    return products
}

async function GetPluginCode(fetch: { (input: RequestInfo): Promise<Response> }) {
    let products: Array<Product> = [];
    let max = 1;
    let offset = 0;
    let keyword = "";
    try {
        let resp = await fetch(`${PluginBaseUrl}/api/searchPlugins?max=${max}&offset=${offset}&search=${keyword}`);
        let dto: { plugins: Array<PluginDto> } = await resp.json();
        let getDetailByPluginId = async function (id: number): Promise<PluginDetail> {
            let resp = await fetch(`${PluginBaseUrl}/api/plugins/${id}`)
            return await resp.json();
        }
        for (let plugin of dto.plugins) {
            if (plugin.PricingModel === "FREE") {
                continue;
            }
            if (plugin.Icon !== "") {
                plugin.Icon = PluginBaseUrl + plugin.Icon
            }
            let detail = await getDetailByPluginId(plugin.ID);
            let code = detail.PurchaseInfo.ProductCode;
            if (code === "") {
                continue;
            }
            products.push(
                {
                    code: detail.PurchaseInfo.ProductCode,
                    name: detail.Name,
                    productFamilyName: '',
                    version: ''
                }
            );
        }
    } catch (error) {
        return products;
    }
    return products;
}