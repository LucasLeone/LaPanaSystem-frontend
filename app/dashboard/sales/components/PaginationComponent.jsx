"use client";

import { Pagination } from "@nextui-org/react";

const PaginationComponent = ({
  totalPages,
  currentPage,
  onPageChange,
  totalCount,
  displayedCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
        Mostrando {displayedCount} de {totalCount} ventas
      </p>
      <Pagination
        total={totalPages}
        initialPage={currentPage}
        page={currentPage}
        onChange={onPageChange}
        size="sm"
        showShadow={true}
        color="primary"
      />
    </div>
  );
};

export default PaginationComponent;
