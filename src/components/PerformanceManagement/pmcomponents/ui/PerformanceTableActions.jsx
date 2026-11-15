
import { Button, HStack, IconButton, Tooltip } from "@chakra-ui/react";

const PerformanceTableActions = ({ actions = [], row = null }) => {
  return (
    <HStack spacing={2}>
      {actions.map((action) => {
        const handleClick = () => action.onClick?.(row);
        const label = action.getLabel?.(row) ?? action.label;
        const icon = action.getIcon?.(row) ?? action.icon;
        const colorScheme = action.getColorScheme?.(row) || action.colorScheme;
        const variant = action.getVariant?.(row) || action.variant;
        const isLoading = action.isLoading?.(row) || false;
        const isDisabled =
          action.getIsDisabled?.(row) || action.disabled?.(row) || false;

        if (icon && action.iconOnly) {
          return (
            <Tooltip key={action.label} label={action.label}>
              <IconButton
                aria-label={label}
                icon={icon}
                size={action.size || "sm"}
                variant={variant || "ghost"}
                colorScheme={colorScheme || "gray"}
                onClick={handleClick}
                isDisabled={isDisabled}
              />
            </Tooltip>
          );
        }

        return (
          <Button
            key={action.label}
            size={action.size || "sm"}
            colorScheme={colorScheme || (icon ? "gray" : "blue")}
            variant={variant || (icon ? "outline" : "solid")}
            leftIcon={icon}
            borderRadius={action.borderRadius}
            h={action.h}
            px={action.px}
            onClick={handleClick}
            isLoading={isLoading}
            loadingText={action.loadingText}
            isDisabled={isDisabled}
          >
            {label}
          </Button>
        );
      })}
    </HStack>
  );
};
export default PerformanceTableActions;
