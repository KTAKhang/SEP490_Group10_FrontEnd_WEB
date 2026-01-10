
import { useSelector } from 'react-redux';

// Tạm thời disable việc gọi API để tránh vòng lập vô tận khi backend không khả dụng
export const useAboutUs = () => {
    const { publicData: aboutData, error } = useSelector((state) => state.about || {});

    // Không gọi API nữa, chỉ trả về dữ liệu có sẵn trong store
    // Điều này sẽ ngăn vòng lập vô tận khi backend không khả dụng


    return {
        aboutData: aboutData || null,
        loading: false, // Tạm thời set false để không loading
        error
    };
};