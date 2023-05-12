
export const generateParams = (parent: number, sort: string): string => {
    let URL = ''
    if (parent) {
        URL = `?parent=${+parent}`
    }
    if (sort) {
        URL = `?sort=${sort}`
    }
    if (parent && sort) {
        URL = `?parent=${+parent}&sort=${sort}`
    }
    return URL
}