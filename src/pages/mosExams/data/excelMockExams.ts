import type { MosMockExam } from '../types'

export const excelMockExams: MosMockExam[] = [
  {
    id: 'excel-mo210-mock-01',
    app: 'Excel',
    code: 'MO-210-E01',
    title: 'Đề Excel 01 - Báo cáo doanh số quý',
    difficulty: 'Trung bình',
    durationMinutes: 50,
    passingScore: 700,
    sourceNote:
      'Thiết kế theo outline MOS Excel Associate: quản lý workbook/worksheet, cells/ranges, tables, formulas/functions và charts.',
    scenario:
      'Bạn nhận workbook doanh số theo quý. Hãy làm sạch dữ liệu, tạo bảng, dùng công thức tổng hợp, trực quan hóa doanh số và chuẩn bị file để in/xuất PDF.',
    starterFiles: ['quarterly-sales-draft.xlsx', 'sales-import.csv'],
    deliverables: ['quarterly-sales-final.xlsx', 'quarterly-sales-summary.pdf'],
    tasks: [
      {
        id: 'e01-t01',
        skill: 'Manage worksheets and workbooks',
        title: 'Thiết lập workbook và import dữ liệu',
        instruction:
          'Import sales-import.csv vào worksheet mới tên Raw Data. Đổi tên các sheet thành Raw Data, Summary và Charts. Freeze top row ở Raw Data và đặt workbook properties Title là "Quarterly Sales Report".',
        points: 16,
        checklist: [
          'CSV import đúng cột, không dồn dữ liệu vào một cột.',
          'Tên worksheet đúng yêu cầu.',
          'Freeze top row và workbook properties được thiết lập.',
        ],
      },
      {
        id: 'e01-t02',
        skill: 'Manage data cells and ranges',
        title: 'Làm sạch cells và định dạng dữ liệu',
        instruction:
          'AutoFit toàn bộ cột, định dạng cột Sales thành Currency, cột Date thành Short Date. Dùng Flash Fill hoặc Text to Columns để tách Region Code nếu dữ liệu đang gộp trong mã bán hàng.',
        points: 17,
        checklist: [
          'Cột dữ liệu đủ rộng, dễ đọc.',
          'Currency/Date format đúng.',
          'Region Code được tách bằng công cụ phù hợp, không gõ tay toàn bộ.',
        ],
      },
      {
        id: 'e01-t03',
        skill: 'Manage tables and table data',
        title: 'Tạo Excel Table cho dữ liệu bán hàng',
        instruction:
          'Chuyển vùng Raw Data thành Table tên SalesTable, bật Total Row, áp table style có banded rows và sort theo Sales giảm dần.',
        points: 18,
        checklist: [
          'Table có header và tên SalesTable.',
          'Total Row bật đúng.',
          'Sort Sales giảm dần và table style rõ ràng.',
        ],
      },
      {
        id: 'e01-t04',
        skill: 'Use formulas and functions',
        title: 'Tính KPI bằng hàm',
        instruction:
          'Ở sheet Summary, dùng SUM, AVERAGE, MAX, MIN và COUNTIF/SUMIF để tính tổng sales, sales trung bình, đơn cao nhất, đơn thấp nhất và số giao dịch theo Region.',
        points: 20,
        checklist: [
          'Công thức tham chiếu đúng vùng/table.',
          'COUNTIF/SUMIF trả đúng kết quả theo Region.',
          'Không thay công thức bằng số tĩnh.',
        ],
      },
      {
        id: 'e01-t05',
        skill: 'Manage charts',
        title: 'Tạo biểu đồ doanh số',
        instruction:
          'Tạo clustered column chart so sánh Sales theo Region trên sheet Charts. Thêm chart title, data labels, đổi chart style dễ đọc và đặt chart vừa trong vùng in.',
        points: 17,
        checklist: [
          'Chart lấy đúng nguồn dữ liệu Summary.',
          'Title/data labels/chart style đầy đủ.',
          'Chart nằm gọn trong vùng in.',
        ],
      },
      {
        id: 'e01-t06',
        skill: 'Manage worksheets and workbooks',
        title: 'Chuẩn bị in và xuất PDF',
        instruction:
          'Set print area cho Summary và Charts, đặt orientation Landscape, fit sheet on one page nếu phù hợp. Kiểm tra Print Preview rồi export PDF.',
        points: 12,
        checklist: [
          'Print area đúng nội dung cần nộp.',
          'Page setup hợp lý, không cắt chart/table.',
          'PDF xuất từ workbook final.',
        ],
      },
    ],
  },
  {
    id: 'excel-mo210-mock-02',
    app: 'Excel',
    code: 'MO-210-E02',
    title: 'Đề Excel 02 - Theo dõi điểm học viên',
    difficulty: 'Trung bình',
    durationMinutes: 50,
    passingScore: 700,
    sourceNote:
      'Đề mô phỏng MOS Excel Associate cho tình huống lớp học: ranges, named ranges, conditional formatting, tables, formulas và chart.',
    scenario:
      'Bạn cần hoàn thiện workbook theo dõi điểm học viên MOS. Dữ liệu cần được chuẩn hóa, tính điểm trung bình/xếp loại, tô màu cảnh báo và tạo chart cho giáo viên xem nhanh.',
    starterFiles: ['student-scores-draft.xlsx'],
    deliverables: ['student-scores-final.xlsx', 'student-scores-report.pdf'],
    tasks: [
      {
        id: 'e02-t01',
        skill: 'Manage worksheets and workbooks',
        title: 'Tổ chức workbook lớp học',
        instruction:
          'Đổi tên worksheet thành Scores, Lookup và Dashboard. Ẩn gridlines trên Dashboard, freeze panes tại Scores để giữ hàng tiêu đề và cột Student Name.',
        points: 14,
        checklist: [
          'Sheet names đúng.',
          'Dashboard không còn gridlines.',
          'Freeze panes giữ đúng hàng/cột khi cuộn.',
        ],
      },
      {
        id: 'e02-t02',
        skill: 'Manage data cells and ranges',
        title: 'Named ranges và data validation',
        instruction:
          'Tạo named range cho danh sách lớp ở Lookup. Áp data validation dạng list cho cột Class trong Scores và dùng Format Painter để đồng bộ định dạng điểm.',
        points: 17,
        checklist: [
          'Named range hoạt động đúng.',
          'Data validation chỉ cho chọn lớp hợp lệ.',
          'Định dạng điểm đồng nhất.',
        ],
      },
      {
        id: 'e02-t03',
        skill: 'Manage tables and table data',
        title: 'Chuyển Scores thành Table',
        instruction:
          'Chuyển vùng Scores thành Table tên ScoresTable. Filter chỉ học viên trạng thái Active, sort theo Average giảm dần và thêm slicer theo Class nếu phiên bản Excel hỗ trợ.',
        points: 17,
        checklist: [
          'ScoresTable có header đúng.',
          'Filter Active và sort Average đúng.',
          'Slicer Class được thêm nếu khả dụng.',
        ],
      },
      {
        id: 'e02-t04',
        skill: 'Use formulas and functions',
        title: 'Tính điểm trung bình và xếp loại',
        instruction:
          'Dùng AVERAGE tính điểm trung bình. Dùng IF hoặc IFS để xếp loại: >=850 Excellent, >=700 Pass, còn lại Review. Dùng COUNTIF để đếm học viên cần Review.',
        points: 22,
        checklist: [
          'Average tính từ các cột điểm đúng.',
          'IF/IFS xếp loại đúng ngưỡng.',
          'COUNTIF đếm Review chính xác.',
        ],
      },
      {
        id: 'e02-t05',
        skill: 'Manage data cells and ranges',
        title: 'Conditional formatting cảnh báo',
        instruction:
          'Áp conditional formatting cho Average: xanh nếu >=850, vàng nếu 700-849, đỏ nếu dưới 700. Highlight duplicate Student ID nếu có.',
        points: 14,
        checklist: [
          'Màu Average đúng theo ngưỡng.',
          'Duplicate Student ID được highlight.',
          'Rule order không làm sai màu.',
        ],
      },
      {
        id: 'e02-t06',
        skill: 'Manage charts',
        title: 'Dashboard chart theo lớp',
        instruction:
          'Tạo chart trên Dashboard thể hiện số học viên Pass/Review theo Class. Thêm chart title, legend rõ ràng và đặt chart trong print area.',
        points: 16,
        checklist: [
          'Chart phản ánh đúng Pass/Review theo Class.',
          'Title/legend dễ hiểu.',
          'Dashboard in ra gọn một trang.',
        ],
      },
    ],
  },
  {
    id: 'excel-mo210-mock-03',
    app: 'Excel',
    code: 'MO-210-E03',
    title: 'Đề Excel 03 - Quản lý tồn kho',
    difficulty: 'Khó',
    durationMinutes: 50,
    passingScore: 700,
    sourceNote:
      'Đề mô phỏng MOS Excel Associate nhấn mạnh workbook views, paste options, tables, structured references, formulas và charts cho dữ liệu tồn kho.',
    scenario:
      'Bạn cần hoàn thiện workbook tồn kho cho cửa hàng. File cần có dữ liệu sạch, bảng tồn kho có filter/sort, công thức cảnh báo hàng sắp hết, biểu đồ tồn kho và bản in gửi quản lý.',
    starterFiles: ['inventory-draft.xlsx', 'new-items.txt'],
    deliverables: ['inventory-final.xlsx', 'inventory-dashboard.pdf'],
    tasks: [
      {
        id: 'e03-t01',
        skill: 'Manage worksheets and workbooks',
        title: 'View và page setup workbook',
        instruction:
          'Tạo sheet Inventory, Reorder và Dashboard. Đặt workbook view Normal cho sheet dữ liệu, Page Layout để kiểm tra Dashboard. Thêm header chứa tên cửa hàng khi in.',
        points: 14,
        checklist: [
          'Sheet được tạo/đặt tên đúng.',
          'View dùng đúng mục đích.',
          'Header in có tên cửa hàng.',
        ],
      },
      {
        id: 'e03-t02',
        skill: 'Manage data cells and ranges',
        title: 'Paste options và Flash Fill',
        instruction:
          'Nhập new-items.txt vào Inventory. Dùng Paste Values để tránh kéo định dạng lạ. Dùng Flash Fill để tạo SKU ngắn từ Category và Item Name.',
        points: 17,
        checklist: [
          'Dữ liệu mới được thêm đúng dòng/cột.',
          'Paste Values không phá format hiện có.',
          'SKU ngắn tạo theo pattern hợp lý.',
        ],
      },
      {
        id: 'e03-t03',
        skill: 'Manage tables and table data',
        title: 'Inventory table và filter hàng cần nhập',
        instruction:
          'Chuyển dữ liệu thành Table tên InventoryTable. Filter các item có Quantity nhỏ hơn Reorder Level, sort theo Category rồi Quantity tăng dần.',
        points: 18,
        checklist: [
          'InventoryTable có tên đúng.',
          'Filter Quantity < Reorder Level chính xác.',
          'Sort nhiều cấp đúng yêu cầu.',
        ],
      },
      {
        id: 'e03-t04',
        skill: 'Use formulas and functions',
        title: 'Tính trạng thái tồn kho',
        instruction:
          'Thêm cột Reorder Status dùng IF để trả về "Reorder" nếu Quantity <= Reorder Level, ngược lại "OK". Dùng SUMIF để tính tổng value theo Category và COUNTIF đếm item cần nhập.',
        points: 22,
        checklist: [
          'IF trả đúng Reorder/OK.',
          'SUMIF theo Category đúng.',
          'COUNTIF đếm đúng số item cần nhập.',
        ],
      },
      {
        id: 'e03-t05',
        skill: 'Manage charts',
        title: 'Biểu đồ tồn kho theo Category',
        instruction:
          'Tạo bar chart tổng Inventory Value theo Category trên Dashboard. Đổi chart title, format axis currency và áp chart style sạch.',
        points: 16,
        checklist: [
          'Chart dùng đúng tổng value theo Category.',
          'Axis format currency.',
          'Chart style dễ đọc khi in.',
        ],
      },
      {
        id: 'e03-t06',
        skill: 'Manage worksheets and workbooks',
        title: 'Bảo vệ và xuất báo cáo',
        instruction:
          'Protect sheet Dashboard để tránh sửa chart vô ý, để các sheet dữ liệu vẫn chỉnh được. Set print area Dashboard và export PDF.',
        points: 13,
        checklist: [
          'Dashboard được protect phù hợp.',
          'Sheet dữ liệu vẫn dùng được.',
          'PDF chỉ gồm Dashboard cần gửi.',
        ],
      },
    ],
  },
  {
    id: 'excel-mo210-mock-04',
    app: 'Excel',
    code: 'MO-210-E04',
    title: 'Đề Excel 04 - Danh sách đăng ký lớp',
    difficulty: 'Dễ',
    durationMinutes: 40,
    passingScore: 700,
    sourceNote:
      'Đề luyện mức dễ theo outline MOS Excel Associate, tập trung vào thao tác workbook, cells/ranges, table cơ bản, công thức đơn giản và chart nhanh.',
    scenario:
      'Bạn cần chuẩn hóa file đăng ký lớp MOS. Dữ liệu cần rõ ràng, có filter, vài công thức đếm/tổng hợp đơn giản và một chart nhỏ để giáo viên xem số lượng học viên theo lớp.',
    starterFiles: ['class-registration-draft.xlsx'],
    deliverables: ['class-registration-final.xlsx', 'class-registration-summary.pdf'],
    tasks: [
      {
        id: 'e04-t01',
        skill: 'Manage worksheets and workbooks',
        title: 'Đặt tên sheet và lưu workbook',
        instruction:
          'Lưu file thành class-registration-final.xlsx. Đổi tên sheet chính thành Registrations, tạo thêm sheet Summary và đặt tab color khác nhau cho hai sheet.',
        points: 15,
        checklist: [
          'File final được lưu đúng tên.',
          'Sheet Registrations và Summary tồn tại.',
          'Tab color giúp phân biệt sheet.',
        ],
      },
      {
        id: 'e04-t02',
        skill: 'Manage data cells and ranges',
        title: 'Format dữ liệu đăng ký',
        instruction:
          'AutoFit các cột, định dạng cột Registration Date dạng Short Date và cột Phone dạng Text để không mất số 0 đầu.',
        points: 18,
        checklist: [
          'Cột đủ rộng và dễ đọc.',
          'Registration Date đúng định dạng ngày.',
          'Phone giữ nguyên số 0 đầu.',
        ],
      },
      {
        id: 'e04-t03',
        skill: 'Manage tables and table data',
        title: 'Tạo table đăng ký',
        instruction:
          'Chuyển vùng dữ liệu thành Table tên RegistrationTable, áp style có banded rows và bật filter. Sort theo Class rồi Registration Date.',
        points: 20,
        checklist: [
          'Table tên RegistrationTable.',
          'Banded rows/filter được bật.',
          'Sort Class và Registration Date đúng.',
        ],
      },
      {
        id: 'e04-t04',
        skill: 'Use formulas and functions',
        title: 'Đếm học viên theo lớp',
        instruction:
          'Trên sheet Summary, dùng COUNTIF để đếm số học viên đăng ký từng lớp Word, Excel và PowerPoint. Dùng COUNTA để tính tổng số đăng ký.',
        points: 22,
        checklist: [
          'COUNTIF trả đúng số theo lớp.',
          'COUNTA tính tổng số đăng ký.',
          'Công thức còn trong ô, không thay bằng số tĩnh.',
        ],
      },
      {
        id: 'e04-t05',
        skill: 'Manage charts',
        title: 'Chart số lượng đăng ký',
        instruction:
          'Tạo pie chart hoặc column chart từ bảng Summary, thêm title "Registrations by Class" và data labels.',
        points: 15,
        checklist: [
          'Chart lấy đúng dữ liệu Summary.',
          'Title đúng.',
          'Data labels hiển thị rõ.',
        ],
      },
      {
        id: 'e04-t06',
        skill: 'Manage worksheets and workbooks',
        title: 'In summary',
        instruction:
          'Set print area cho sheet Summary, đặt orientation Portrait hoặc Landscape phù hợp rồi export PDF.',
        points: 10,
        checklist: [
          'Print area chỉ gồm phần Summary cần in.',
          'Page setup không cắt chart.',
          'PDF xuất đúng nội dung.',
        ],
      },
    ],
  },
  {
    id: 'excel-mo210-mock-05',
    app: 'Excel',
    code: 'MO-210-E05',
    title: 'Đề Excel 05 - Chi phí sự kiện nhỏ',
    difficulty: 'Dễ',
    durationMinutes: 40,
    passingScore: 700,
    sourceNote:
      'Đề luyện mức dễ cho Excel Associate, ưu tiên định dạng range, table, công thức SUM/AVERAGE và chart ngân sách đơn giản.',
    scenario:
      'Bạn cần hoàn thiện workbook chi phí cho một sự kiện nhỏ. File cần có bảng chi phí, tổng ngân sách, định dạng tiền tệ, cảnh báo khoản vượt dự kiến và biểu đồ cơ cấu chi phí.',
    starterFiles: ['event-budget-draft.xlsx'],
    deliverables: ['event-budget-final.xlsx', 'event-budget-print.pdf'],
    tasks: [
      {
        id: 'e05-t01',
        skill: 'Manage worksheets and workbooks',
        title: 'Sắp xếp workbook ngân sách',
        instruction:
          'Đổi tên sheet thành Budget và Summary. Đặt page orientation Landscape cho Budget và thêm footer có page number.',
        points: 14,
        checklist: [
          'Sheet names đúng.',
          'Budget dùng Landscape.',
          'Footer có page number tự động.',
        ],
      },
      {
        id: 'e05-t02',
        skill: 'Manage data cells and ranges',
        title: 'Định dạng chi phí',
        instruction:
          'Định dạng các cột Planned Cost, Actual Cost và Variance là Currency. Dùng cell styles để làm nổi bật dòng tổng.',
        points: 18,
        checklist: [
          'Các cột tiền tệ đúng format.',
          'Dòng tổng nổi bật nhưng vẫn dễ đọc.',
          'Không làm mất dữ liệu gốc.',
        ],
      },
      {
        id: 'e05-t03',
        skill: 'Manage tables and table data',
        title: 'Tạo bảng BudgetTable',
        instruction:
          'Chuyển vùng chi phí thành Table tên BudgetTable, bật Total Row và filter Category.',
        points: 18,
        checklist: [
          'Table tên BudgetTable.',
          'Total Row hoạt động.',
          'Filter Category có thể dùng được.',
        ],
      },
      {
        id: 'e05-t04',
        skill: 'Use formulas and functions',
        title: 'Tính variance và tổng chi phí',
        instruction:
          'Thêm cột Variance = Actual Cost - Planned Cost. Dùng SUM tính tổng Planned/Actual và AVERAGE tính chi phí trung bình.',
        points: 24,
        checklist: [
          'Variance đúng từng dòng.',
          'SUM Planned/Actual chính xác.',
          'AVERAGE tính đúng chi phí trung bình.',
        ],
      },
      {
        id: 'e05-t05',
        skill: 'Manage data cells and ranges',
        title: 'Conditional formatting vượt ngân sách',
        instruction:
          'Áp conditional formatting cho Variance: đỏ nếu lớn hơn 0, xanh nếu nhỏ hơn hoặc bằng 0.',
        points: 12,
        checklist: [
          'Variance > 0 hiển thị đỏ.',
          'Variance <= 0 hiển thị xanh.',
          'Rule không áp nhầm cột.',
        ],
      },
      {
        id: 'e05-t06',
        skill: 'Manage charts',
        title: 'Biểu đồ cơ cấu chi phí',
        instruction:
          'Tạo chart thể hiện Actual Cost theo Category, thêm chart title và đặt chart trên sheet Summary.',
        points: 14,
        checklist: [
          'Chart lấy đúng Actual Cost theo Category.',
          'Title rõ ràng.',
          'Chart nằm trên Summary.',
        ],
      },
    ],
  },
  {
    id: 'excel-mo210-mock-06',
    app: 'Excel',
    code: 'MO-210-E06',
    title: 'Đề Excel 06 - Dashboard hiệu suất bán hàng',
    difficulty: 'Khó',
    durationMinutes: 55,
    passingScore: 700,
    sourceNote:
      'Đề luyện mức khó cho Excel Associate, kết hợp structured references, nhiều điều kiện công thức, table filtering, conditional formatting, chart và print/export dashboard.',
    scenario:
      'Bạn cần tạo dashboard hiệu suất bán hàng từ workbook nhiều sheet. Quản lý muốn xem doanh thu, tỷ lệ đạt target, top performer, cảnh báo vùng yếu và biểu đồ tổng hợp để in một trang.',
    starterFiles: ['sales-performance-draft.xlsx', 'targets.csv'],
    deliverables: ['sales-performance-dashboard.xlsx', 'sales-performance-dashboard.pdf'],
    tasks: [
      {
        id: 'e06-t01',
        skill: 'Manage worksheets and workbooks',
        title: 'Chuẩn bị workbook nhiều sheet',
        instruction:
          'Import targets.csv vào sheet Targets. Tạo sheet Dashboard, đặt tab color nổi bật, hide sheet Raw Notes nếu có và kiểm tra workbook properties.',
        points: 13,
        checklist: [
          'Targets import đúng.',
          'Dashboard được tạo và dễ nhận diện.',
          'Sheet không cần thiết được hide, không xóa dữ liệu.',
        ],
      },
      {
        id: 'e06-t02',
        skill: 'Manage data cells and ranges',
        title: 'Chuẩn hóa vùng dữ liệu',
        instruction:
          'Dùng Remove Duplicates nếu có giao dịch trùng, Text to Columns hoặc Flash Fill để tách Sales Rep từ mã giao dịch, và áp number format phù hợp cho Revenue.',
        points: 17,
        checklist: [
          'Duplicate được xử lý đúng phạm vi.',
          'Sales Rep tách đúng pattern.',
          'Revenue format tiền tệ rõ ràng.',
        ],
      },
      {
        id: 'e06-t03',
        skill: 'Manage tables and table data',
        title: 'SalesTable và filter nâng cao',
        instruction:
          'Chuyển dữ liệu chính thành Table tên SalesTable. Filter chỉ các giao dịch Completed, sort Revenue giảm dần và thêm Total Row cho Revenue.',
        points: 17,
        checklist: [
          'SalesTable có tên đúng.',
          'Filter Completed chính xác.',
          'Total Row tính Revenue.',
        ],
      },
      {
        id: 'e06-t04',
        skill: 'Use formulas and functions',
        title: 'KPI target và top performer',
        instruction:
          'Dùng SUMIF/SUMIFS để tính Revenue theo Region và Sales Rep. Dùng IF để đánh dấu Met Target khi Revenue >= Target. Dùng MAX để tìm doanh thu cao nhất.',
        points: 25,
        checklist: [
          'SUMIF/SUMIFS đúng điều kiện.',
          'IF Met Target đúng ngưỡng.',
          'MAX trả đúng doanh thu cao nhất.',
        ],
      },
      {
        id: 'e06-t05',
        skill: 'Manage data cells and ranges',
        title: 'Format cảnh báo hiệu suất',
        instruction:
          'Áp data bars cho Revenue, icon set hoặc color scale cho % Target và highlight các Region dưới 80% target.',
        points: 13,
        checklist: [
          'Data bars áp đúng Revenue.',
          '% Target có visual format rõ.',
          'Region dưới 80% được highlight.',
        ],
      },
      {
        id: 'e06-t06',
        skill: 'Manage charts',
        title: 'Dashboard chart tổng hợp',
        instruction:
          'Tạo combo hoặc clustered column chart thể hiện Revenue và Target theo Region. Thêm title, legend, data labels chính và đặt chart trên Dashboard.',
        points: 15,
        checklist: [
          'Chart so sánh Revenue và Target đúng.',
          'Title/legend/data labels hợp lý.',
          'Dashboard in một trang không bị cắt.',
        ],
      },
    ],
  },
]

export const mosExcelSkillWeights = [
  { skill: 'Manage worksheets and workbooks', weight: '10-15%' },
  { skill: 'Manage data cells and ranges', weight: '20-25%' },
  { skill: 'Manage tables and table data', weight: '15-20%' },
  { skill: 'Use formulas and functions', weight: '20-25%' },
  { skill: 'Manage charts', weight: '20-25%' },
] as const
