module.exports = {
    tabWidth: 4,
    plugins: ["@trivago/prettier-plugin-sort-imports"],
    importOrder: [
        "^react$",
        "^next",
        "<THIRD_PARTY_MODULES>",
        "^@/api$",
        "^@/store",
        "^@/validation",
        "^@/components",
        "^@/types",
        "^[./]((?!module\\.scss).)*$",
        "\\.module\\.scss$",
    ],
    importOrderSeparation: false,
    importOrderSortSpecifiers: true,
    importOrderGroupNamespaceSpecifiers: true,
    overrides: [
        {
            files: ["*.css", "*.scss", "*.sass"],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
